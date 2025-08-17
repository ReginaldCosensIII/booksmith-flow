import { Button } from "@/components/ui/button";
import { PenTool, Menu, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  showMobileToggle?: boolean;
}

const Header = ({ onMobileMenuToggle, showMobileToggle = false }: HeaderProps) => {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith('/auth');
  const isLanding = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showMobileToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuToggle}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-hero">
              <PenTool className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-hero bg-clip-text text-transparent">
              The Booksmith
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {!isAuthPage && !isLanding && (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLanding ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/auth/register">Get Started</Link>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;