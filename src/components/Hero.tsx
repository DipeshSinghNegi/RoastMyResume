import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  totalRoasts: number;
}

export const Hero = ({ totalRoasts }: HeroProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <Flame className="absolute top-32 left-[15%] w-8 h-8 text-primary/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Flame className="absolute bottom-40 right-[20%] w-6 h-6 text-primary/20 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Hot badge */}
      <div className="mb-8 animate-fade-in">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-bold shadow-lg hover-scale">
          HOT! <Flame className="w-4 h-4" />
        </span>
      </div>

      {/* Main headline */}
      <div className="text-center mb-8 animate-fade-in space-y-4" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Your resume's about to
          <br />
          <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent inline-flex items-center gap-4">
            get roasted <Flame className="inline w-12 h-12 md:w-16 md:h-16 text-primary" />
          </span>
        </h1>
      </div>

      {/* Subheadline */}
      <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-fade-in max-w-2xl text-center" style={{ animationDelay: '0.4s' }}>
        Upload. Burn. Improve. It's career therapy - AI style.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <Button 
          size="lg" 
          className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow transition-all duration-300 hover-scale"
          onClick={() => navigate('/roast')}
        >
          <Flame className="mr-2 w-5 h-5" />
          Try It Now - It's Free!
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="text-lg px-8 py-6 border-2 hover-scale"
          onClick={() => {
            document.getElementById('samples')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          📄 See Examples
        </Button>
      </div>

      {/* Info card */}
      <div className="bg-card rounded-2xl shadow-card p-6 max-w-2xl mx-auto animate-fade-in border border-border" style={{ animationDelay: '0.8s' }}>
        <p className="text-center text-muted-foreground flex items-center justify-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-medium">AI-powered feedback that's actually helpful (but still burns a bit)</span>
        </p>
      </div>

      {/* Roast counter */}
      <div className="absolute top-8 right-8 flex items-center gap-2 bg-card rounded-full px-4 py-2 shadow-lg border border-border animate-fade-in">
        <span className="font-bold text-primary text-xl">{totalRoasts}</span>
        <span className="text-sm text-muted-foreground">Roasted</span>
        <Flame className="w-4 h-4 text-primary" />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce">
        <p className="text-sm text-muted-foreground mb-2">See how it works</p>
        <div className="flex justify-center">
          <span className="text-primary text-2xl">↓</span>
        </div>
      </div>
    </section>
  );
};
