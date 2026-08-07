import { useEffect, useState } from "react";
import { Store, Package, FolderTree, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
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
      <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
        {isSuperAdmin ? "সুপার অ্যাডমিন ড্যাশবোর্ড" : "অ্যাডমিন ড্যাশবোর্ড"}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts[key] ?? "..."}</p>
            </CardContent>
          </Card>
        ))}
        <Card className={pendingSellers > 0 ? "border-accent" : ""}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">অপেক্ষমাণ সেলার</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingSellers}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
