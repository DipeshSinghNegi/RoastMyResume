import { Upload, Zap, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "1. Upload Resume",
      description: "Drag & drop your resume or click to browse. We support PDF, DOCX, and TXT formats.",
    },
    {
      icon: Zap,
      title: "2. AI Analysis",
      description: "Our advanced AI scans your resume and provides detailed, actionable feedback in seconds.",
    },
    {
      icon: Sparkles,
      title: "3. Improve & Win",
      description: "Apply the suggestions, refine your resume, and increase your chances of landing interviews.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get professional feedback in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border-2 hover:shadow-primary transition-all duration-300 hover:-translate-y-2 group bg-card"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-primary group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
              </CardContent>
              
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-accent opacity-50" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
