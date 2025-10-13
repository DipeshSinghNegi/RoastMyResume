import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { RoastSamples } from "@/components/RoastSamples";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [totalRoasts, setTotalRoasts] = useState(83);

  useEffect(() => {
    fetchTotalRoasts();
  }, []);

  const fetchTotalRoasts = async () => {
    try {
      const { count, error } = await supabase
        .from('roasts')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setTotalRoasts(count || 83);
    } catch (error) {
      console.error('Error fetching roast count:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero totalRoasts={totalRoasts} />
      <HowItWorks />
      <RoastSamples />
    </div>
  );
};

export default Index;
