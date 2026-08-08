import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  Store,
  LayoutDashboard,
  ShieldCheck,
  User,
  Sparkles,
  Heart,
  KeyRound,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.jsx";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useMobileMenu } from "@/context/MobileMenuContext.jsx";
import { ROUTES } from "@/constants/routes";
import { ROLES, isAdminOrAbove } from "@/constants/roles";
import { cn } from "@/lib/utils";

export default function Header() {
  const [query, setQuery] = useState("");
  // মোবাইল মেনুর open/close state এখন MobileMenuContext থেকে আসছে, যাতে
  // Bottom Navigation-এর "☰ মেনু" ট্যাব থেকেও এই একই প্যানেল খোলা যায় —
  // আলাদা ডুপ্লিকেট মেনু-লজিক বানানো হয়নি।
  const { isOpen: mobileOpen, close: closeMobileMenu, toggle: toggleMobileMenu } = useMobileMenu();
  const { isLoggedIn, role, profile, signOut } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
      closeMobileMenu();
    }
  };

  const displayName = profile?.full_name?.trim() || "আমার অ্যাকাউন্ট";
  const avatarInitial = (profile?.full_name?.trim()?.charAt(0) || "ব").toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="kantha-divider" />
      <div className="container flex h-16 items-center gap-3 md:gap-5">
        {/* লোগো/ব্র্যান্ড — অপরিবর্তিত */}
        <Link to={ROUTES.HOME} className="flex shrink-0 items-center gap-2">
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
          <span
            className="text-lg font-bold leading-none tracking-tight text-primary md:text-xl"
            style={{ fontFamily: "'Tiro Bangla', serif" }}
          >
            {settings.site_name}
          </span>
        </Link>

        {/* সার্চ — কম্প্যাক্ট, রাউন্ডেড, প্রিমিয়াম লুক */}
        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="দোকান বা পণ্য খুঁজুন..."
            className="h-10 rounded-full border-border/80 bg-secondary/40 pl-10 shadow-none transition-colors focus-visible:bg-background"
          />
        </form>

        {/* ডেস্কটপ — কম্প্যাক্ট অ্যাকাউন্ট এলাকা */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon" asChild className="rounded-full" title="সংরক্ষিত">
                <Link to={ROUTES.SAVED} aria-label="সংরক্ষিত">
                  <Heart className="h-[18px] w-[18px]" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-border/80 py-1 pl-1 pr-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/70"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {avatarInitial}
                    </span>
                    <span className="max-w-[9rem] truncate">{displayName}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdminOrAbove(role) && (
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.ADMIN}>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        অ্যাডমিন প্যানেল
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.DASHBOARD}>
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      {role === ROLES.SELLER ? "সেলার ড্যাশবোর্ড" : "ড্যাশবোর্ড"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={ROUTES.ACCOUNT}>
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      পাসওয়ার্ড পরিবর্তন
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    লগ আউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <User className="h-4 w-4" />
                  অ্যাকাউন্টে প্রবেশ
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

        {/* মোবাইল হ্যামবার্গার — সবসময় অ্যাক্সেসিবল */}
        <button
          type="button"
          className={cn(
            "ml-auto flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden",
            mobileOpen && "bg-secondary"
          )}
          onClick={() => toggleMobileMenu()}
          aria-label={mobileOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="container flex flex-col gap-4 border-t border-border py-4 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="দোকান বা পণ্য খুঁজুন..."
              className="h-10 rounded-full border-border/80 bg-secondary/40 pl-10 shadow-none"
            />
          </form>

          {isLoggedIn ? (
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center gap-2.5 rounded-lg bg-secondary/50 px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {avatarInitial}
                </span>
                <span className="truncate text-sm font-semibold">{displayName}</span>
              </div>

              <Link
                to={ROUTES.SAVED}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-secondary"
                onClick={() => closeMobileMenu()}
              >
                <Heart className="h-4 w-4 text-muted-foreground" />
                সংরক্ষিত
              </Link>
              {isAdminOrAbove(role) && (
                <Link
                  to={ROUTES.ADMIN}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-secondary"
                  onClick={() => closeMobileMenu()}
                >
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  অ্যাডমিন প্যানেল
                </Link>
              )}
              <Link
                to={ROUTES.DASHBOARD}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-secondary"
                onClick={() => closeMobileMenu()}
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                {role === ROLES.SELLER ? "সেলার ড্যাশবোর্ড" : "ড্যাশবোর্ড"}
              </Link>
              <Link
                to={ROUTES.ACCOUNT}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-secondary"
                onClick={() => closeMobileMenu()}
              >
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                পাসওয়ার্ড পরিবর্তন
              </Link>

              <div className="my-1 border-t border-border" />
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                লগ আউট
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-center border-primary/25 text-primary shadow-sm hover:border-primary/50 hover:bg-primary/5"
                onClick={() => closeMobileMenu()}
              >
                <Link to={ROUTES.LOGIN}>
                  <User className="h-4 w-4" />
                  অ্যাকাউন্টে প্রবেশ
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="w-full justify-center bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-md shadow-accent/30"
                onClick={() => closeMobileMenu()}
              >
                <Link to={ROUTES.REGISTER}>
                  <Sparkles className="h-4 w-4" />
                  সেলার হোন
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
