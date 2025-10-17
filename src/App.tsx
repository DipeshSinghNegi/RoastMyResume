import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Roast from "./pages/Roast";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar totalRoasts={totalRoasts} />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/roast" element={<Roast />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
