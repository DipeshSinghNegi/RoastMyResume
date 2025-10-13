import { FileText, Flame, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const steps = [
  {
    icon: FileText,
    title: "Upload Resume",
    description: "Drag & drop your PDF or Word resume file.",
    details: "We support all major file formats, including PDF, DOCX, and TXT.",
  },
  {
    icon: Flame,
    title: "Get Roasted",
    description: "Watch as our AI brutally (but helpfully) roasts your resume.",
    details: "Our AI analyzes common mistakes like vague statements, clichés, and missing metrics.",
  },
  {
    icon: Lightbulb,
    title: "Improve",
    description: "Apply the suggestions and watch your resume transform.",
    details: "Each roast includes actionable feedback to make your resume stand out.",
  },
];

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI doesn't just critique - it roasts with purpose, helping you stand out in the job market.
          </p>
        </div>

        {/* Steps cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover-scale ${
                  isActive ? 'border-primary border-2 shadow-warm' : 'border-border'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                    isActive ? 'bg-gradient-to-br from-primary to-primary-hover' : 'bg-secondary'
                  }`}>
                    <Icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-primary'}`} />
                  </div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                  <CardDescription className="text-base">{step.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Active step details */}
        <div className="animate-fade-in">
          <Card className="bg-card shadow-card border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = steps[activeStep].icon;
                  return <Icon className="w-8 h-8 text-primary" />;
                })()}
                <CardTitle className="text-3xl">{steps[activeStep].title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">{steps[activeStep].details}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
