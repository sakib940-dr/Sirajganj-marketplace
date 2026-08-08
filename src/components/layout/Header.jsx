import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Store, LayoutDashboard, ShieldCheck, LogIn, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ROUTES } from "@/constants/routes";
import { ROLES, isAdminOrAbove } from "@/constants/roles";

export default function Header() {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn, role, signOut } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="kantha-divider" />
      <div className="container flex h-16 items-center gap-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
          {settings.site_logo_url ? (
            <img
              src={settings.site_logo_url}
              alt={settings.site_name}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </span>
          )}
          <span className="text-xl font-bold text-primary" style={{ fontFamily: "'Tiro Bangla', serif" }}>
            {settings.site_name}
          </span>
        </Link>

        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="দোকান বা পণ্য খুঁজুন..."
            className="pl-9"
          />
        </form>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.SAVED}>
                  <Heart className="h-4 w-4" />
                  সংরক্ষিত
                </Link>
              </Button>
              {isAdminOrAbove(role) && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={ROUTES.ADMIN}>
                    <ShieldCheck className="h-4 w-4" />
                    অ্যাডমিন প্যানেল
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.DASHBOARD}>
                  <LayoutDashboard className="h-4 w-4" />
                  {role === ROLES.SELLER ? "সেলার ড্যাশবোর্ড" : "ড্যাশবোর্ড"}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                লগ আউট
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-primary/25 text-primary shadow-sm hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                <Link to={ROUTES.LOGIN}>
                  <LogIn className="h-4 w-4" />
                  লগইন
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="relative overflow-hidden bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-md shadow-accent/30 transition-transform hover:scale-[1.03] hover:shadow-lg hover:shadow-accent/40"
              >
                <Link to={ROUTES.REGISTER}>
                  <Sparkles className="h-4 w-4" />
                  সেলার হোন
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="মেনু খুলুন"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="container flex flex-col gap-3 border-t border-border py-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="দোকান বা পণ্য খুঁজুন..."
              className="pl-9"
            />
          </form>
          {isLoggedIn ? (
            <>
              <Link to={ROUTES.SAVED} className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                সংরক্ষিত
              </Link>
              {isAdminOrAbove(role) && (
                <Link to={ROUTES.ADMIN} className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  অ্যাডমিন প্যানেল
                </Link>
              )}
              <Link to={ROUTES.DASHBOARD} className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                {role === ROLES.SELLER ? "সেলার ড্যাশবোর্ড" : "ড্যাশবোর্ড"}
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                লগ আউট
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-center border-primary/25 text-primary shadow-sm hover:border-primary/50 hover:bg-primary/5"
                onClick={() => setMobileOpen(false)}
              >
                <Link to={ROUTES.LOGIN}>
                  <LogIn className="h-4 w-4" />
                  লগইন
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="w-full justify-center bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-md shadow-accent/30"
                onClick={() => setMobileOpen(false)}
              >
                <Link to={ROUTES.REGISTER}>
                  <Sparkles className="h-4 w-4" />
                  সেলার হোন
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
