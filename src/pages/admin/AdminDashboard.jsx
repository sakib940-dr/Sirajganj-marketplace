import { useEffect, useState } from "react";
import {
  Store,
  Package,
  FolderTree,
  Users,
  ArrowUpRight,
  BadgeCheck,
  ShieldAlert,
  Eye,
  Heart,
  MousePointerClick,
  Trophy,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSuperAdminAnalytics } from "@/hooks/admin/useSuperAdminAnalytics.js";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StatCard,
  RankedListCard,
  GrowthPeriodCard,
} from "@/components/admin/analytics/SuperAdminAnalyticsWidgets.jsx";

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

  // Super Admin Analytics — শুধুমাত্র super_admin হলেই RPC কল হয় (enabled flag),
  // তাই সাধারণ Admin-এর জন্য কোনো এক্সট্রা কোয়েরি বা রিয়েলটাইম সাবস্ক্রিপশন
  // তৈরি হয় না, existing Admin dashboard আগের মতোই কাজ করে
  const {
    data: analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useSuperAdminAnalytics({ enabled: isSuperAdmin });

  const totals = analytics?.totals ?? {};
  const growth = analytics?.growth ?? {};

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

      {/* ================= Super Admin Analytics ================= */}
      {isSuperAdmin && (
        <div className="space-y-6 border-t border-border pt-6">
          <div>
            <h2
              className="flex items-center gap-2 text-lg font-bold"
              style={{ fontFamily: "'Tiro Bangla', serif" }}
            >
              <BarChart3 className="h-5 w-5 text-primary" />
              মার্কেটপ্লেস অ্যানালিটিক্স
            </h2>
            <p className="text-sm text-muted-foreground">
              পুরো মার্কেটপ্লেসের সার্বিক পরিসংখ্যান — স্বয়ংক্রিয়ভাবে আপডেট হয় (near real-time)
            </p>
            {analyticsError && (
              <p className="mt-2 text-sm text-destructive">তথ্য লোড করা যায়নি: {analyticsError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              title="মোট ইউজার"
              icon={Users}
              value={totals.total_users ?? 0}
              loading={analyticsLoading}
            />
            <StatCard
              title="অ-ভেরিফাইড সেলার আবেদন"
              icon={ShieldAlert}
              value={totals.total_unverified_seller_applications ?? 0}
              loading={analyticsLoading}
            />
            <StatCard
              title="ভেরিফাইড সেলার"
              icon={BadgeCheck}
              value={totals.total_verified_sellers ?? 0}
              loading={analyticsLoading}
            />
            <StatCard
              title="মোট পণ্য"
              icon={Package}
              value={totals.total_products ?? 0}
              loading={analyticsLoading}
            />
            <StatCard
              title="মোট পণ্য ভিউ"
              icon={Eye}
              value={totals.total_product_views ?? 0}
              loading={analyticsLoading}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RankedListCard
              title="টপ ১০ সেলার (অর্ডার ক্লিক অনুযায়ী)"
              icon={Trophy}
              loading={analyticsLoading}
              emptyLabel="এখনো কোনো অর্ডার ক্লিক নেই"
              items={(analytics?.top_sellers ?? []).map((s) => ({
                id: s.shop_id,
                imageUrl: s.logo_url,
                title: s.shop_name,
                metricValue: s.total_order_clicks,
                metricLabel: "ক্লিক",
              }))}
            />
            <RankedListCard
              title="টপ ক্যাটাগরি"
              icon={FolderTree}
              loading={analyticsLoading}
              emptyLabel="এখনো কোনো পণ্য নেই"
              items={(analytics?.top_categories ?? []).map((c) => ({
                id: c.id,
                title: c.name,
                subtitle: `${c.total_views} ভিউ`,
                metricValue: c.product_count,
                metricLabel: "পণ্য",
              }))}
            />
            <RankedListCard
              title="টপ ১০ সর্বাধিক দেখা পণ্য"
              icon={Eye}
              loading={analyticsLoading}
              emptyLabel="এখনো কোনো ভিউ নেই"
              items={(analytics?.top_viewed_products ?? []).map((p) => ({
                id: p.id,
                imageUrl: p.thumbnail_url,
                title: p.name,
                subtitle: p.shop_name,
                metricValue: p.view_count,
                metricLabel: "ভিউ",
              }))}
            />
            <RankedListCard
              title="টপ ১০ সর্বাধিক সেভ করা পণ্য"
              icon={Heart}
              loading={analyticsLoading}
              emptyLabel="এখনো কোনো সেভ নেই"
              items={(analytics?.top_saved_products ?? []).map((p) => ({
                id: p.id,
                imageUrl: p.thumbnail_url,
                title: p.name,
                subtitle: p.shop_name,
                metricValue: p.save_count,
                metricLabel: "সেভ",
              }))}
            />
          </div>

          <div>
            <h3 className="mb-3 text-base font-semibold">গ্রোথ সামারি</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <GrowthPeriodCard
                title="দৈনিক"
                icon={CalendarClock}
                loading={analyticsLoading}
                stats={[
                  { label: "নতুন ইউজার", value: growth.daily?.new_users ?? 0 },
                  { label: "নতুন সেলার আবেদন", value: growth.daily?.new_seller_applications ?? 0 },
                  { label: "নতুন পণ্য", value: growth.daily?.new_products ?? 0 },
                ]}
              />
              <GrowthPeriodCard
                title="সাপ্তাহিক"
                icon={CalendarDays}
                loading={analyticsLoading}
                stats={[
                  { label: "নতুন ইউজার", value: growth.weekly?.new_users ?? 0 },
                  { label: "নতুন সেলার আবেদন", value: growth.weekly?.new_seller_applications ?? 0 },
                  { label: "নতুন পণ্য", value: growth.weekly?.new_products ?? 0 },
                ]}
              />
              <GrowthPeriodCard
                title="মাসিক"
                icon={CalendarRange}
                loading={analyticsLoading}
                stats={[
                  { label: "নতুন ইউজার", value: growth.monthly?.new_users ?? 0 },
                  { label: "নতুন সেলার আবেদন", value: growth.monthly?.new_seller_applications ?? 0 },
                  { label: "নতুন পণ্য", value: growth.monthly?.new_products ?? 0 },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
