import { Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Store, Package, Images, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar.jsx";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: ROUTES.DASHBOARD, label: "ওভারভিউ", icon: LayoutDashboard, end: true },
  { to: ROUTES.DASHBOARD_SHOP, label: "দোকানের তথ্য", icon: Store },
  { to: ROUTES.DASHBOARD_PRODUCTS, label: "পণ্যসমূহ", icon: Package },
  { to: ROUTES.DASHBOARD_GALLERY, label: "গ্যালারি", icon: Images },
];

export default function DashboardLayout() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container flex h-14 items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            মূল সাইটে ফিরুন
          </Link>
          <span className="text-sm font-medium">{profile?.full_name || "সেলার প্যানেল"}</span>
        </div>
      </div>
      <div className="container flex flex-col gap-6 py-6 md:flex-row">
        <Sidebar items={navItems} title="সেলার ড্যাশবোর্ড" />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
