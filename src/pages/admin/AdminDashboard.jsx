import { useEffect, useState } from "react";
import { Store, Package, FolderTree, Users, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATS = [
  { key: "shops", label: "মোট দোকান", icon: Store, table: "shops" },
  { key: "products", label: "মোট পণ্য", icon: Package, table: "products" },
  { key: "categories", label: "মোট ক্যাটাগরি", icon: FolderTree, table: "categories" },
];

export default function AdminDashboard() {
  const { role } = useAuth();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const [counts, setCounts] = useState({});
  const [pendingSellers, setPendingSellers] = useState(0);

  useEffect(() => {
    STATS.forEach(async ({ key, table }) => {
      const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
      setCounts((prev) => ({ ...prev, [key]: count ?? 0 }));
    });
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "seller")
      .eq("seller_status", "pending")
      .then(({ count }) => setPendingSellers(count ?? 0));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          {isSuperAdmin ? "সুপার অ্যাডমিন ড্যাশবোর্ড" : "অ্যাডমিন ড্যাশবোর্ড"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">মার্কেটপ্লেসের সার্বিক পরিসংখ্যান এক নজরে</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">{counts[key] ?? "..."}</p>
            </CardContent>
          </Card>
        ))}

        <Link to={ROUTES.ADMIN_VERIFICATIONS} className="block">
          <Card
            className={`h-full overflow-hidden transition-shadow hover:shadow-md ${
              pendingSellers > 0 ? "border-accent/50 bg-accent/5" : ""
            }`}
          >
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">অপেক্ষমাণ সেলার</CardTitle>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Users className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold tabular-nums">{pendingSellers}</p>
                {pendingSellers > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-accent">
                    পর্যালোচনা করুন
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to={ROUTES.ADMIN_SELLERS}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" /> সেলার ম্যানেজমেন্ট
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          to={ROUTES.ADMIN_PRODUCTS}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4 text-primary" /> পণ্য ম্যানেজমেন্ট
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          to={ROUTES.ADMIN_CATEGORIES}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <FolderTree className="h-4 w-4 text-primary" /> ক্যাটাগরি
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
