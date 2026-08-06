import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Store, Images, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PendingApprovalNotice from "@/components/seller/PendingApprovalNotice.jsx";
import { ROUTES } from "@/constants/routes";
import { ROLES, SELLER_STATUS } from "@/constants/roles";

export default function DashboardHome() {
  const { user, role, sellerStatus, profile } = useAuth();
  const [productCount, setProductCount] = useState(null);
  const [hasShop, setHasShop] = useState(null);

  const isApprovedSeller =
    role === ROLES.SUPER_ADMIN || (role === ROLES.SELLER && sellerStatus === SELLER_STATUS.APPROVED);

  useEffect(() => {
    if (!isApprovedSeller || !user) return;
    supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(async ({ data: shop }) => {
        setHasShop(!!shop);
        if (shop) {
          const { count } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("shop_id", shop.id);
          setProductCount(count ?? 0);
        } else {
          setProductCount(0);
        }
      });
  }, [isApprovedSeller, user]);

  if (!isApprovedSeller) {
    return <PendingApprovalNotice status={sellerStatus} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          স্বাগতম, {profile?.full_name || "সেলার"}
        </h1>
        <p className="text-sm text-muted-foreground">আপনার দোকান এখান থেকে পরিচালনা করুন</p>
      </div>

      {hasShop === false && (
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
          আপনার দোকানের তথ্য এখনো পূরণ করা হয়নি।{" "}
          <Link to={ROUTES.DASHBOARD_SHOP} className="font-medium text-primary hover:underline">
            এখনই পূরণ করুন
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট পণ্য</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productCount ?? "..."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">দোকানের অবস্থা</CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{hasShop ? "সক্রিয়" : "অসম্পূর্ণ"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to={ROUTES.DASHBOARD_SHOP} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40">
          <span className="flex items-center gap-2 text-sm font-medium"><Store className="h-4 w-4 text-primary" /> দোকানের তথ্য</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to={ROUTES.DASHBOARD_PRODUCTS} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40">
          <span className="flex items-center gap-2 text-sm font-medium"><Package className="h-4 w-4 text-primary" /> পণ্য ম্যানেজ করুন</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to={ROUTES.DASHBOARD_GALLERY} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40">
          <span className="flex items-center gap-2 text-sm font-medium"><Images className="h-4 w-4 text-primary" /> গ্যালারি</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
