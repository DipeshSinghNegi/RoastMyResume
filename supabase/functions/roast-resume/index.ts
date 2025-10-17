import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Check Authorization header for Supabase Service Role Key
    const authHeader = req.headers.get('authorization');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
    
    if (!authHeader || !serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
      console.error('Unauthorized request - missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Service Role Key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { resumeText } = await req.json();
    console.log('Roasting resume with length:', resumeText?.length);
    console.log('Resume text preview:', resumeText?.substring(0, 200) + '...');

    // Validate input
    if (!resumeText || resumeText.trim().length === 0) {
      console.error('Missing or empty resumeText');
      return new Response(
        JSON.stringify({ error: 'Resume text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate resume text if it's too long (Gemini has token limits)
    const maxLength = 2000; // Very conservative limit to ensure it works
    const processedResumeText = resumeText.length > maxLength 
      ? resumeText.substring(0, maxLength) + '\n\n[Content truncated for processing]'
      : resumeText;
    
    if (resumeText.length > maxLength) {
      console.log(`Resume text truncated from ${resumeText.length} to ${processedResumeText.length} characters`);
    }

    // Check for Gemini API key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a brutally honest but constructive resume critic. Your job is to "roast" resume lines in a witty, memorable way while providing actionable feedback. 

Guidelines:
- Be sharp and funny, but never cruel or personal
- Focus on common mistakes: vagueness, clichés, outdated skills, lack of metrics
- Keep roasts to 2-3 sentences max
- Always imply how to improve (e.g., "Show us numbers or we'll assume zero")
- Use modern workplace references and humor
- Categorize the issue (vague, cliche, outdated, missing_metrics, buzzwords, other)

CRITICAL: Respond ONLY with valid JSON. Do NOT use markdown code blocks, do NOT add any text before or after the JSON. Start your response with { and end with }.

Required JSON format:
{
  "roasts": [
    {
      "original": "the original resume line",
      "roast": "your witty roast feedback", 
      "category": "vague|cliche|outdated|missing_metrics|buzzwords|other"
    }
  ]
}`;

    console.log('Calling Gemini API...');
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let response;
    try {
      // Call Google Gemini API
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nRoast this resume content:\n\n${processedResumeText}`
            }]
          }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 400) {
        return new Response(
          JSON.stringify({ error: 'Invalid request to AI service. Please check your input.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate roast' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timeout - please try again' }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Network error - please try again' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received:', JSON.stringify(data, null, 2));

    // Extract content from Gemini response - try multiple possible structures
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Try alternative response structures
    if (!content) {
      content = data.candidates?.[0]?.content?.text;
    }
    
    if (!content) {
      content = data.text;
    }
    
    if (!content) {
      console.error('No content in Gemini response. Full response:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: 'No response from AI service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Raw AI content:', content);

    // Try to parse JSON response safely
    let roastData;
    try {
      // Clean the content - remove any markdown formatting or extra text
      let cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^```.*$/gm, '') // Remove any remaining code block markers
        .trim();
      
      // Try to extract JSON from the content if it's wrapped in other text
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }
      
      console.log('Cleaned content for parsing:', cleanedContent.substring(0, 200) + '...');
      
      roastData = JSON.parse(cleanedContent);
      
      // Validate the structure
      if (!roastData.roasts || !Array.isArray(roastData.roasts)) {
        throw new Error('Invalid response structure');
      }
      
      console.log('Successfully parsed JSON response with', roastData.roasts.length, 'roasts');
      
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Raw content that failed to parse:', content.substring(0, 500) + '...');
      
      // Fallback: create a simple roast structure
      roastData = {
        roasts: [{
          original: processedResumeText.substring(0, 100) + (processedResumeText.length > 100 ? '...' : ''),
          roast: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
          category: 'other'
        }]
      };
      
      console.log('Using fallback roast structure');
    }

    return new Response(
      JSON.stringify(roastData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in roast-resume function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});