import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Package,
  CheckCircle2,
  PackageX,
  TrendingUp,
  Eye,
  Heart,
  MousePointerClick,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PendingApprovalNotice from "@/components/seller/PendingApprovalNotice.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import { ROLES, SELLER_STATUS, isAdminOrAbove } from "@/constants/roles";

// শুধু অ্যানালিটিক্সের জন্য দরকারি কলামগুলোই সিলেক্ট করা হয় (দ্রুত query-র জন্য) —
// shop_id-তে ফিল্টার + view_count অনুযায়ী সর্ট, দুটোই ইনডেক্স করা কলামে
const ANALYTICS_SELECT =
  "id, name, thumbnail_url, is_active, stock_quantity, view_count, save_count, click_count";

function StatCard({ title, icon: Icon, value, loading }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{loading ? "..." : value}</p>
      </CardContent>
    </Card>
  );
}

// "সর্বাধিক দেখা" / "সর্বাধিক সেভ করা" পণ্যের র‍্যাংকড লিস্ট — দুই জায়গাতেই ব্যবহৃত
function TopProductsCard({ title, icon: Icon, products, metricKey, metricLabel, emptyLabel }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="space-y-1">
            {products.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {p.thumbnail_url && (
                    <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <span className="line-clamp-1 flex-1 text-sm font-medium">{p.name}</span>
                <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                  {p[metricKey] ?? 0}
                  <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
                    {metricLabel}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
      .select(ANALYTICS_SELECT)
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

  // near-real-time আপডেট: এই দোকানের কোনো পণ্যের view/save/click/stock/status
  // বাড়লে বা কমলেই (Supabase Realtime দিয়ে) সামারি কার্ড, টপ-লিস্ট ও টেবিল
  // স্বয়ংক্রিয়ভাবে আপডেট হবে — পেজ রিফ্রেশ বা পোলিং করার দরকার নেই
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
                    stock_quantity: payload.new.stock_quantity,
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
              stock_quantity: payload.new.stock_quantity,
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

  // সব সামারি সংখ্যা একবারেই হিসাব করা হয় — products state বদলালেই (initial লোড
  // বা realtime আপডেট) মেমোতে রিক্যালকুলেট হবে, আলাদা কোনো query লাগে না
  const stats = useMemo(() => {
    let activeProducts = 0;
    let outOfStockProducts = 0;
    let views = 0;
    let saves = 0;
    let clicks = 0;
    for (const p of products) {
      if (p.is_active) activeProducts += 1;
      if (Number(p.stock_quantity ?? 0) <= 0) outOfStockProducts += 1;
      views += p.view_count ?? 0;
      saves += p.save_count ?? 0;
      clicks += p.click_count ?? 0;
    }
    return {
      totalProducts: products.length,
      activeProducts,
      outOfStockProducts,
      views,
      saves,
      clicks,
    };
  }, [products]);

  const mostViewed = useMemo(
    () =>
      [...products]
        .filter((p) => (p.view_count ?? 0) > 0)
        .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
        .slice(0, 5),
    [products]
  );

  const mostSaved = useMemo(
    () =>
      [...products]
        .filter((p) => (p.save_count ?? 0) > 0)
        .sort((a, b) => (b.save_count ?? 0) - (a.save_count ?? 0))
        .slice(0, 5),
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
        <p className="text-sm text-muted-foreground">
          আপনার দোকানের পণ্যের পরিসংখ্যান — সংখ্যাগুলো স্বয়ংক্রিয়ভাবে আপডেট হয় (near real-time)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard title="মোট পণ্য" icon={Package} value={stats.totalProducts} loading={loading} />
        <StatCard
          title="সক্রিয় পণ্য"
          icon={CheckCircle2}
          value={stats.activeProducts}
          loading={loading}
        />
        <StatCard
          title="স্টক শেষ"
          icon={PackageX}
          value={stats.outOfStockProducts}
          loading={loading}
        />
        <StatCard title="মোট ভিউ" icon={Eye} value={stats.views} loading={loading} />
        <StatCard title="মোট সেভ" icon={Heart} value={stats.saves} loading={loading} />
        <StatCard
          title="অর্ডার বাটন ক্লিক"
          icon={MousePointerClick}
          value={stats.clicks}
          loading={loading}
        />
      </div>

      {loading ? (
        <LoadingSpinner label="লোড হচ্ছে..." />
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="এখনো কোনো পণ্য যোগ করা হয়নি" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <TopProductsCard
              title="সর্বাধিক দেখা পণ্য"
              icon={Eye}
              products={mostViewed}
              metricKey="view_count"
              metricLabel="ভিউ"
              emptyLabel="এখনো কোনো ভিউ নেই"
            />
            <TopProductsCard
              title="সর্বাধিক সেভ করা পণ্য"
              icon={Heart}
              products={mostSaved}
              metricKey="save_count"
              metricLabel="সেভ"
              emptyLabel="এখনো কোনো সেভ নেই"
            />
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold">সব পণ্যের বিস্তারিত পরিসংখ্যান</h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[640px] text-sm">
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
                    <th className="p-3 font-medium">স্টক</th>
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
                          className={`font-medium ${
                            Number(p.stock_quantity ?? 0) <= 0
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {p.stock_quantity ?? 0}
                        </span>
                      </td>
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
          </div>
        </>
      )}
    </div>
  );
}
