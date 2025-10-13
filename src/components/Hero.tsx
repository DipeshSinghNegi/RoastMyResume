import { Button } from "@/components/ui/button";
import { Zap, TrendingUp } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  totalRoasts: number;
}

export const Hero = ({ totalRoasts }: HeroProps) => {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");

  const handleFileSelect = (text: string) => {
    setResumeText(text);
    navigate('/roast', { state: { resumeText: text } });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <Zap className="absolute top-32 left-[15%] w-8 h-8 text-primary/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <TrendingUp className="absolute bottom-40 right-[20%] w-6 h-6 text-accent/30 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Badge */}
      <div className="mb-6 animate-fade-in">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-full text-sm font-bold shadow-lg hover-scale">
          <Zap className="w-4 h-4" /> AI-POWERED
        </span>
      </div>

      {/* Main headline */}
      <div className="text-center mb-6 animate-fade-in space-y-4" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
          Get Your Resume
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Brutally Reviewed
          </span>
        </h1>
      </div>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-fade-in max-w-2xl text-center" style={{ animationDelay: '0.2s' }}>
        AI-powered feedback that tells you what recruiters really think. No sugar coating, just honest critique.
      </p>

      {/* Upload Zone */}
      <div className="w-full max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <UploadZone onFileSelect={handleFileSelect} />
      </div>

      {/* CTA button */}
      <div className="flex flex-col items-center gap-3 mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <Button 
          size="lg" 
          variant="outline"
          className="text-base px-6 py-5 border-2 hover-scale"
          onClick={() => {
            document.getElementById('samples')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          👀 See Example Reviews
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{totalRoasts}+</div>
          <div className="text-sm text-muted-foreground">Resumes Reviewed</div>
        </div>
        <div className="w-px h-12 bg-border"></div>
        <div className="text-center">
          <div className="text-3xl font-bold text-accent">100%</div>
          <div className="text-sm text-muted-foreground">Free Forever</div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce">
        <div className="flex justify-center">
          <span className="text-primary text-2xl">↓</span>
        </div>
      </div>
    </section>
  );
};
