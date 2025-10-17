import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Laugh, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Roast {
  id: string;
  original_text: string;
  roast_feedback: string;
  fire_count: number;
  laugh_count: number;
  thinking_count: number;
}

// Sample data for demonstration
const sampleRoasts: Roast[] = [
  {
    id: "1",
    original_text: "Experienced professional with strong communication skills and ability to work in a team environment.",
    roast_feedback: "This is the most generic sentence in resume history. It's like saying 'I can breathe and sometimes I talk to people.' Every recruiter's eyes glaze over at this point. Be specific! What did you actually accomplish? How did you improve team communication? Give us numbers, results, impact!",
    fire_count: 42,
    laugh_count: 18,
    thinking_count: 7
  },
  {
    id: "2", 
    original_text: "Responsible for various tasks and duties as assigned by management.",
    roast_feedback: "This is literally saying 'I do whatever my boss tells me to do.' It's not a job description, it's a surrender. What were you actually responsible for? What value did you bring? This screams 'I have no idea what I actually did here.' Be specific about your impact!",
    fire_count: 38,
    laugh_count: 25,
    thinking_count: 12
  },
  {
    id: "3",
    original_text: "Proficient in Microsoft Office Suite including Word, Excel, and PowerPoint.",
    roast_feedback: "Congratulations, you can use software that 99% of the population uses daily. This is like saying 'I can use a calculator' in 2024. What did you actually DO with these tools? Did you create complex spreadsheets that saved the company $50K? Did you design presentations that won major clients? Show impact, not just basic computer literacy!",
    fire_count: 29,
    laugh_count: 31,
    thinking_count: 15
  }
];

export const RoastSamples = () => {
  const [samples, setSamples] = useState<Roast[]>(sampleRoasts);

  const handleReaction = (roastId: string, reactionType: string) => {
    // Update local state for demo purposes
    setSamples(prev => prev.map(sample => {
      if (sample.id === roastId) {
        return {
          ...sample,
          [`${reactionType}_count`]: sample[`${reactionType}_count` as keyof Roast] as number + 1
        };
      }
      return sample;
    }));
  };


  return (
    <section id="samples" className="py-24 px-4 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Real Reviews</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See what our AI found in real resumes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {samples.map((sample, index) => (
            <Card
              key={sample.id}
              className="overflow-hidden hover-scale transition-all duration-300 shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Tabs defaultValue="roast" className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="roast" className="text-sm font-semibold">
                      <Zap className="w-4 h-4 mr-1" />
                      The Review
                    </TabsTrigger>
                    <TabsTrigger value="before" className="text-sm">
                      Original
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="roast" className="mt-0 space-y-4">
                    <div>
                      <p className="text-sm italic text-muted-foreground mb-2">Original Resume Line:</p>
                      <p className="text-sm font-medium mb-4">{sample.original_text}</p>
                    </div>

                    <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4">
                      <p className="text-sm text-foreground leading-relaxed">{sample.roast_feedback}</p>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <span className="text-xs text-muted-foreground">Reactions:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:bg-transparent"
                        onClick={() => handleReaction(sample.id, 'fire')}
                      >
                        <Flame className="w-4 h-4 mr-1 text-primary" />
                        <span className="text-xs font-bold">{sample.fire_count}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:bg-transparent"
                        onClick={() => handleReaction(sample.id, 'laugh')}
                      >
                        <Laugh className="w-4 h-4 mr-1" />
                        <span className="text-xs">{sample.laugh_count}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:bg-transparent"
                        onClick={() => handleReaction(sample.id, 'thinking')}
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        <span className="text-xs">{sample.thinking_count}</span>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="before" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">BEFORE:</p>
                        <p className="text-sm">{sample.original_text}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary mb-2">AFTER (Improved):</p>
                        <p className="text-sm text-muted-foreground italic">
                          Apply the roast feedback to transform this line!
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
