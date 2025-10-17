import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UploadZone } from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, ArrowLeft, Loader2, Smile, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoastResult {
  original: string;
  roast: string;
  category: string;
}

const Roast = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [roasts, setRoasts] = useState<RoastResult[]>([]);
  const [isRoasting, setIsRoasting] = useState(false);

  // Check if resume text was passed from the home page
  useEffect(() => {
    if (location.state?.resumeText) {
      setResumeText(location.state.resumeText);
    }
  }, [location.state]);

  const handleRoast = async () => {
    if (!resumeText || resumeText.trim().length === 0) {
      toast({
        title: "No resume content",
        description: "Please upload a resume file first.",
        variant: "destructive",
      });
      return;
    }

    setIsRoasting(true);

    try {
      const { data, error } = await supabase.functions.invoke('roast-resume', {
        body: { resumeText },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`
        }
      });

      if (error) {
        if (error.message?.includes('Rate limit')) {
          toast({
            title: "Whoa, slow down! 🔥",
            description: "Too many roasts at once. Take a breather and try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Payment required')) {
          toast({
            title: "Out of roast credits",
            description: "The AI needs more fuel. Please add credits to continue roasting!",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      console.log('Raw response from server:', data);
      console.log('Type of data:', typeof data);
      console.log('Type of data.roasts:', typeof data?.roasts);
      
      // Handle both parsed JSON and string responses
      let roastData = data;
      
      // If data.roasts is a string (JSON), parse it
      if (typeof data.roasts === 'string') {
        try {
          roastData = JSON.parse(data.roasts);
        } catch (parseError) {
          console.error('Failed to parse roasts string:', parseError);
          throw new Error('Invalid response format from server');
        }
      }
      
      // If data itself is a string (JSON), parse it
      if (typeof data === 'string') {
        try {
          roastData = JSON.parse(data);
        } catch (parseError) {
          console.error('Failed to parse response string:', parseError);
          throw new Error('Invalid response format from server');
        }
      }

      // Ensure we have the correct structure
      if (roastData?.roasts && Array.isArray(roastData.roasts)) {
        console.log('Successfully parsed roasts:', roastData.roasts);
        setRoasts(roastData.roasts);
        
        // Store roasts in database
        for (const roast of roastData.roasts) {
          await supabase.from('roasts').insert({
            original_text: roast.original,
            roast_feedback: roast.roast,
            roast_type: roast.category
          });
        }

        toast({
          title: "Resume roasted! 🔥",
          description: `Found ${roastData.roasts.length} areas to improve.`,
        });
      } else {
        console.error('Invalid response structure:', roastData);
        console.error('Expected roasts array, got:', typeof roastData?.roasts);
        throw new Error('Invalid response structure from server');
      }

    } catch (error) {
      console.error('Error roasting resume:', error);
      toast({
        title: "Roast failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRoasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Roast My Resume</h1>
          </div>
        </div>

        {/* Upload section - only show if no resume text */}
        {!resumeText && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <UploadZone onFileSelect={setResumeText} />
          </div>
        )}

        {/* Resume uploaded confirmation */}
        {resumeText && roasts.length === 0 && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Resume Ready for Roasting! 🔥</p>
                    <p className="text-sm text-muted-foreground">
                      Your resume has been processed and is ready to get roasted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Roast button */}
        {resumeText && roasts.length === 0 && (
          <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button
              size="lg"
              onClick={handleRoast}
              disabled={isRoasting}
              className="bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow text-lg px-8 py-6"
            >
              {isRoasting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Roasting...
                </>
              ) : (
                <>
                  <Flame className="mr-2 w-5 h-5" />
                  Get Roasted!
                </>
              )}
            </Button>
          </div>
        )}

        {/* Results */}
        {roasts.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Roast Results 🔥</h2>
              <p className="text-muted-foreground">
                Found {roasts.length} areas that need some heat
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {roasts.map((roast, index) => (
                <Card
                  key={index}
                  className="shadow-card animate-fade-in hover-scale border-2 hover:border-primary/30 transition-all duration-300 h-fit"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                          ⚡ The Review
                        </div>
                        <div className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                          Original
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {roast.category}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Original Resume Line:</p>
                      <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border break-words">
                        {roast.original}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary rounded-lg p-4 mb-4">
                      <div className="flex gap-2">
                        <Flame className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm leading-relaxed font-medium break-words">{roast.roast}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Reactions:</span>
                      <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                        <Flame className="w-4 h-4" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                        <Smile className="w-4 h-4" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                        <Brain className="w-4 h-4" />
                        <span>0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center pt-8">
              <Button
                size="lg"
                onClick={() => {
                  setResumeText("");
                  setRoasts([]);
                }}
                className="gap-2"
              >
                <Flame className="w-5 h-5" />
                Roast Another Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roast;
