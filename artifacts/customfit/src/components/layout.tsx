import { Link, useLocation } from "wouter";
import { useAuth, AUTH_DISABLED } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Menu, X, Scissors } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled || location !== "/" ? "glass-nav py-4" : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Scissors className="w-6 h-6 transition-transform group-hover:rotate-12" />
            <span className="font-serif text-2xl font-semibold tracking-tight">CustomFit</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-black/60 transition-colors">Home</Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="hover:text-black/60 transition-colors">Dashboard</Link>
            )}
            {user?.isAdmin && (
              <Link href="/admin" className="hover:text-black/60 transition-colors text-amber-700">Admin</Link>
            )}
            
            <div className="w-px h-4 bg-border mx-2" />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-xs">{user.phone}</span>
                <button 
                  onClick={logout}
                  className="px-5 py-2 rounded-full border border-border hover:bg-black/5 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href={AUTH_DISABLED ? "/dashboard" : "/auth"}
                className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6"
          >
            <Link href="/" className="text-2xl font-serif">Home</Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-2xl font-serif">Dashboard</Link>
            )}
            {user?.isAdmin && (
              <Link href="/admin" className="text-2xl font-serif text-amber-700">Admin Panel</Link>
            )}
            <div className="h-px bg-border w-full my-4" />
            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="text-left text-2xl font-serif text-muted-foreground"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href={AUTH_DISABLED ? "/dashboard" : "/auth"}
                className="text-2xl font-serif"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="bg-white border-t border-border mt-auto py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5" />
              <span className="font-serif text-xl font-semibold">CustomFit</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm text-balance">
              Redefining everyday elegance through perfect measurements, premium fabrics, and unparalleled craftsmanship.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/">Home</Link></li>
              <li>
                <Link href={AUTH_DISABLED ? "/dashboard" : "/auth"}>Sign In</Link>
              </li>
              <li><Link href="/dashboard">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CustomFit Pants. All rights reserved.</p>
          <p>Crafted with precision.</p>
        </div>
      </footer>
    </div>
  );
}
