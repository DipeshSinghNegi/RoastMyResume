import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Laugh, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Roast {
  id: string;
  original_text: string;
  roast_feedback: string;
  fire_count: number;
  laugh_count: number;
  thinking_count: number;
}

export const RoastSamples = () => {
  const [samples, setSamples] = useState<Roast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const { data, error } = await supabase.rpc('get_sample_roasts', { sample_size: 3 });
      
      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error('Error fetching samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (roastId: string, reactionType: string) => {
    try {
      await supabase.rpc('increment_reaction', {
        roast_id: roastId,
        reaction_type: reactionType
      });
      
      // Update local state
      setSamples(prev => prev.map(sample => {
        if (sample.id === roastId) {
          return {
            ...sample,
            [`${reactionType}_count`]: sample[`${reactionType}_count` as keyof Roast] as number + 1
          };
        }
        return sample;
      }));
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  if (loading) {
    return (
      <section id="samples" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-muted-foreground">Loading samples...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="samples" className="py-20 px-4 bg-gradient-warm">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Live Roast Samples</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our AI transforms bland resume lines into job-winning bullets.
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
                      <Flame className="w-4 h-4 mr-1" />
                      The Roast
                    </TabsTrigger>
                    <TabsTrigger value="before" className="text-sm">
                      Before & After
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="roast" className="mt-0 space-y-4">
                    <div>
                      <p className="text-sm italic text-muted-foreground mb-2">Original Resume Line:</p>
                      <p className="text-sm font-medium mb-4">{sample.original_text}</p>
                    </div>

                    <div className="bg-destructive/10 border-l-4 border-primary rounded-lg p-4">
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
