import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, Store, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useMobileMenu } from "@/context/MobileMenuContext.jsx";

// Visitor-দের জন্য প্রিমিয়াম app-স্টাইল fixed bottom navigation।
// বিদ্যমান রুট (ROUTES) ও মোবাইল মেনু (MobileMenuContext, Header-এর সাথে
// শেয়ার্ড) ব্যবহার করেই বানানো — কোনো নতুন ডুপ্লিকেট নেভিগেশন-লজিক বা রুট
// তৈরি করা হয়নি। শুধু MainLayout (Visitor-facing পাবলিক পেজ)-এ ব্যবহৃত হয়,
// তাই Seller/Admin UI অস্পৃষ্ট থাকে (তাদের নিজস্ব BottomNav/Sidebar আছে)।
export default function VisitorBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen: menuOpen, toggle: toggleMenu } = useMobileMenu();

  // "দোকান" ট্যাব সক্রিয় থাকবে যখন কেউ কোনো নির্দিষ্ট দোকানের পেজে আছে
  // (/shop/:slug) অথবা হোমপেজের "জনপ্রিয় দোকানসমূহ" সেকশনে (#shops) আছে।
  const isShopActive = location.pathname.startsWith("/shop") || location.hash === "#shops";

  const handleShopClick = (e) => {
    e.preventDefault();
    if (location.pathname === ROUTES.HOME) {
      document.getElementById("shops")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `${ROUTES.HOME}#shops`);
    } else {
      navigate(`${ROUTES.HOME}#shops`);
    }
  };

  const navLinkClass = ({ isActive }) =>
    cn(
      "group relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
    );

  const iconWrapClass = (active) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
      active ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105" : "text-current"
    );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)] backdrop-blur supports-[backdrop-filter]:bg-card/85 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Visitor navigation"
    >
      <div className="kantha-divider" />
      <div className="mx-auto flex max-w-md items-stretch">
        <NavLink to={ROUTES.HOME} end className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span className={iconWrapClass(isActive)}>
                <Home className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className="whitespace-nowrap">হোম</span>
            </>
          )}
        </NavLink>

        <NavLink to={ROUTES.SEARCH} className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span className={iconWrapClass(isActive)}>
                <Search className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className="whitespace-nowrap">খুঁজুন</span>
            </>
          )}
        </NavLink>

        <NavLink to={ROUTES.SAVED} className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span className={iconWrapClass(isActive)}>
                <Heart className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className="whitespace-nowrap">সংরক্ষিত</span>
            </>
          )}
        </NavLink>

        <a
          href={`${ROUTES.HOME}#shops`}
          onClick={handleShopClick}
          className={cn(
            "group relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
            isShopActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className={iconWrapClass(isShopActive)}>
            <Store className="h-[19px] w-[19px]" strokeWidth={isShopActive ? 2.4 : 2} />
          </span>
          <span className="whitespace-nowrap">দোকান</span>
        </a>

        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label="মেনু"
          className={cn(
            "group relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
            menuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className={iconWrapClass(menuOpen)}>
            {menuOpen ? (
              <X className="h-[19px] w-[19px]" strokeWidth={2.4} />
            ) : (
              <Menu className="h-[19px] w-[19px]" strokeWidth={2} />
            )}
          </span>
          <span className="whitespace-nowrap">মেনু</span>
        </button>
      </div>
    </nav>
  );
}
