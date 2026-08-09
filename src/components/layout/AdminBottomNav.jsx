import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, FolderTree, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

// অ্যাডমিন প্যানেলের ৫টা সবচেয়ে বেশি ব্যবহৃত সেকশন — মোবাইলে সহজে অ্যাক্সেসের
// জন্য bottom nav হিসেবে দেখানো হয় (ঠিক Seller/Visitor-দের বটম-ন্যাভের মতোই)।
// এই ৫টা আইটেম মোবাইল hamburger drawer-এ আর দেখানো হয় না (দেখুন
// AdminLayout.jsx-এর mobileGroups) — যাতে একই লিংক দু'জায়গায় ডুপ্লিকেট না
// হয়। ডেস্কটপ (lg+) সাইডবারে সবকিছু আগের মতোই একসাথে থাকে, কারণ সেখানে এই
// bottom nav দেখানো হয় না।
const items = [
  { to: ROUTES.ADMIN, label: "হোম", icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_PRODUCTS, label: "পণ্য", icon: Package },
  { to: ROUTES.ADMIN_CATEGORIES, label: "ক্যাটাগরি", icon: FolderTree },
  { to: ROUTES.ADMIN_SELLERS, label: "সেলার", icon: Users },
  { to: ROUTES.ADMIN_VERIFICATIONS, label: "ভেরিফিকেশন", icon: ShieldCheck },
];

export default function AdminBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                    isActive && "bg-primary/10"
                  )}
                >
                  <Icon className="h-[17px] w-[17px]" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                <span className="whitespace-nowrap">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
