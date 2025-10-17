import { FileText, Star } from "lucide-react";

interface NavbarProps {
  totalRoasts: number;
}

export const Navbar = ({ totalRoasts }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">RoastMyResume</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  AI-powered resume analysis and improvement
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              <span>{totalRoasts} Reviews</span>
            </div>
            
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300">
              Get Started - Free! ⭐
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
