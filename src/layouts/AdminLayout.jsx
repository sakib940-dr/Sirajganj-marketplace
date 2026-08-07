import { Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  KeyRound,
  ShieldCheck,
  FolderTree,
  Package,
  GalleryHorizontal,
  Settings,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar.jsx";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { ROLES, ROLE_LABEL_BN } from "@/constants/roles";

export default function AdminLayout() {
  const { role } = useAuth();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  const navItems = [
    { to: ROUTES.ADMIN, label: "ড্যাশবোর্ড", icon: LayoutDashboard, end: true },
    // "ইউজার (রোলসহ)" — সব ইউজারের তালিকা + role — শুধুমাত্র Super Admin দেখতে পাবেন
    ...(isSuperAdmin
      ? [{ to: ROUTES.ADMIN_USERS, label: "ইউজার (রোলসহ)", icon: UserCog }]
      : []),
    // "User Credentials" এলাকা — শুধুমাত্র Super Admin দেখতে পাবেন
    ...(isSuperAdmin
      ? [{ to: ROUTES.ADMIN_CREDENTIALS, label: "লগইন অ্যাক্সেস", icon: KeyRound }]
      : []),
    { to: ROUTES.ADMIN_SELLERS, label: "সেলার ম্যানেজমেন্ট", icon: Users },
    { to: ROUTES.ADMIN_VERIFICATIONS, label: "সেলার ভেরিফিকেশন", icon: ShieldCheck },
    { to: ROUTES.ADMIN_CATEGORIES, label: "ক্যাটাগরি", icon: FolderTree },
    { to: ROUTES.ADMIN_PRODUCTS, label: "পণ্য ম্যানেজমেন্ট", icon: Package },
    // ব্যানার ও সাইট সেটিংস — শুধুমাত্র Super Admin পরিবর্তন করতে পারবেন
    ...(isSuperAdmin
      ? [
          { to: ROUTES.ADMIN_BANNERS, label: "ব্যানার", icon: GalleryHorizontal },
          { to: ROUTES.ADMIN_SETTINGS, label: "সাইট সেটিংস", icon: Settings },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="container flex h-14 items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4" />
            মূল সাইটে ফিরুন
          </Link>
          <span className="text-sm font-medium">{ROLE_LABEL_BN[role] || "অ্যাডমিন"}</span>
        </div>
      </div>
      <div className="container flex flex-col gap-6 py-6 md:flex-row">
        <Sidebar items={navItems} title="অ্যাডমিন প্যানেল" />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
