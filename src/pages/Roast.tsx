import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadZone } from "@/components/UploadZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoastResult {
  original: string;
  roast: string;
  category: string;
}

const Roast = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [roasts, setRoasts] = useState<RoastResult[]>([]);
  const [isRoasting, setIsRoasting] = useState(false);

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
        body: { resumeText }
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

      if (data?.roasts && Array.isArray(data.roasts)) {
        setRoasts(data.roasts);
        
        // Store roasts in database
        for (const roast of data.roasts) {
          await supabase.from('roasts').insert({
            original_text: roast.original,
            roast_feedback: roast.roast,
            roast_type: roast.category
          });
        }

        toast({
          title: "Resume roasted! 🔥",
          description: `Found ${data.roasts.length} areas to improve.`,
        });
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
      <div className="container mx-auto max-w-4xl">
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

        {/* Upload section */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <UploadZone onFileSelect={setResumeText} />
        </div>

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

            {roasts.map((roast, index) => (
              <Card
                key={index}
                className="shadow-card animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-normal text-muted-foreground mb-2">
                        Original Resume Line:
                      </CardTitle>
                      <CardDescription className="text-base text-foreground font-medium">
                        {roast.original}
                      </CardDescription>
                    </div>
                    <span className="ml-4 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {roast.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-destructive/10 border-l-4 border-primary rounded-lg p-4">
                    <div className="flex gap-2">
                      <Flame className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">{roast.roast}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

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
