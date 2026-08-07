import { useEffect, useState } from "react";
import { Package, Store, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PendingApprovalNotice from "@/components/seller/PendingApprovalNotice.jsx";
import { ROLES, SELLER_STATUS, isAdminOrAbove } from "@/constants/roles";

export default function AnalyticsPage() {
  const { user, role, sellerStatus } = useAuth();
  const [productCount, setProductCount] = useState(null);
  const [hasShop, setHasShop] = useState(null);

  const isApprovedSeller =
    isAdminOrAbove(role) || (role === ROLES.SELLER && sellerStatus === SELLER_STATUS.APPROVED);

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
        <h1
          className="flex items-center gap-2 text-xl font-bold"
          style={{ fontFamily: "'Tiro Bangla', serif" }}
        >
          <TrendingUp className="h-5 w-5 text-primary" />
          অ্যানালিটিক্স
        </h1>
        <p className="text-sm text-muted-foreground">আপনার দোকানের সংক্ষিপ্ত পরিসংখ্যান</p>
      </div>

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
    </div>
  );
}
