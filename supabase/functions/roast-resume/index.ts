import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();
    console.log('Roasting resume with length:', resumeText?.length);

    if (!resumeText || resumeText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Resume text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
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
- Categorize the issue (vague, cliche, outdated, missing_metrics, etc.)

Format your response as JSON with this structure:
{
  "roasts": [
    {
      "original": "the original resume line",
      "roast": "your witty roast feedback",
      "category": "vague|cliche|outdated|missing_metrics|buzzwords|other"
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Roast this resume content:\n\n${resumeText}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate roast' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('AI response received');

    // Try to parse JSON response
    let roastData;
    try {
      roastData = JSON.parse(content);
    } catch {
      // If not JSON, create a simple roast structure
      roastData = {
        roasts: [{
          original: resumeText.substring(0, 100),
          roast: content,
          category: 'general'
        }]
      };
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
