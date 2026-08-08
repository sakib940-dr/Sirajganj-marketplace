import { useEffect, useState, useCallback, useMemo } from "react";
import { Package, Store, TrendingUp, Eye, Heart, MousePointerClick } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PendingApprovalNotice from "@/components/seller/PendingApprovalNotice.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import { ROLES, SELLER_STATUS, isAdminOrAbove } from "@/constants/roles";

export default function AnalyticsPage() {
  const { user, role, sellerStatus } = useAuth();
  const [shopId, setShopId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isApprovedSeller =
    isAdminOrAbove(role) || (role === ROLES.SELLER && sellerStatus === SELLER_STATUS.APPROVED);

  const loadProducts = useCallback(async (shop_id) => {
    const { data } = await supabase
      .from("products")
      .select("id, name, thumbnail_url, is_active, view_count, save_count, click_count")
      .eq("shop_id", shop_id)
      .order("view_count", { ascending: false });
    setProducts(data ?? []);
  }, []);

  useEffect(() => {
    if (!isApprovedSeller || !user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(async ({ data: shop }) => {
        if (!active) return;
        setShopId(shop?.id ?? null);
        if (shop) {
          await loadProducts(shop.id);
        } else {
          setProducts([]);
        }
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isApprovedSeller, user, loadProducts]);

  // near-real-time আপডেট: এই দোকানের কোনো পণ্যের view/save/click কাউন্ট
  // বাড়লেই (Supabase Realtime দিয়ে) টেবিল/সামারি স্বয়ংক্রিয়ভাবে আপডেট হবে —
  // পেজ রিফ্রেশ বা পোলিং করার দরকার নেই
  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel(`product-analytics-${shopId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products", filter: `shop_id=eq.${shopId}` },
        (payload) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === payload.new.id
                ? {
                    ...p,
                    view_count: payload.new.view_count,
                    save_count: payload.new.save_count,
                    click_count: payload.new.click_count,
                    is_active: payload.new.is_active,
                    name: payload.new.name,
                    thumbnail_url: payload.new.thumbnail_url,
                  }
                : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products", filter: `shop_id=eq.${shopId}` },
        (payload) => {
          setProducts((prev) => [
            {
              id: payload.new.id,
              name: payload.new.name,
              thumbnail_url: payload.new.thumbnail_url,
              is_active: payload.new.is_active,
              view_count: payload.new.view_count,
              save_count: payload.new.save_count,
              click_count: payload.new.click_count,
            },
            ...prev,
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "products", filter: `shop_id=eq.${shopId}` },
        (payload) => {
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId]);

  const totals = useMemo(
    () =>
      products.reduce(
        (acc, p) => ({
          views: acc.views + (p.view_count ?? 0),
          saves: acc.saves + (p.save_count ?? 0),
          clicks: acc.clicks + (p.click_count ?? 0),
        }),
        { views: 0, saves: 0, clicks: 0 }
      ),
    [products]
  );

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
        <p className="text-sm text-muted-foreground">আপনার দোকান ও প্রতিটি পণ্যের পরিসংখ্যান (near real-time)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট পণ্য</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">দোকানের অবস্থা</CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : shopId ? "সক্রিয়" : "অসম্পূর্ণ"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট ভিউ</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : totals.views}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">মোট সেভ</CardTitle>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : totals.saves}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">অর্ডার বাটন ক্লিক</CardTitle>
            <MousePointerClick className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : totals.clicks}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold">পণ্য অনুযায়ী পরিসংখ্যান</h2>
        {loading ? (
          <LoadingSpinner label="লোড হচ্ছে..." />
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="এখনো কোনো পণ্য যোগ করা হয়নি" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50 text-left">
                <tr>
                  <th className="p-3 font-medium">পণ্য</th>
                  <th className="p-3 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> ভিউ
                    </span>
                  </th>
                  <th className="p-3 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5" /> সেভ
                    </span>
                  </th>
                  <th className="p-3 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <MousePointerClick className="h-3.5 w-3.5" /> অর্ডার ক্লিক
                    </span>
                  </th>
                  <th className="p-3 font-medium">অবস্থা</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="flex items-center gap-3 p-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {p.thumbnail_url && (
                          <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="line-clamp-1 font-medium">{p.name}</span>
                    </td>
                    <td className="p-3 font-medium">{p.view_count ?? 0}</td>
                    <td className="p-3 font-medium">{p.save_count ?? 0}</td>
                    <td className="p-3 font-medium">{p.click_count ?? 0}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          p.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
