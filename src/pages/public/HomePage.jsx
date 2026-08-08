import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Tag, Store, Package, Flame, BadgePercent, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CategoryChipsRow from "@/components/shared/CategoryChipsRow.jsx";
import BannerCarousel from "@/components/shared/BannerCarousel.jsx";
import ShopCard from "@/components/shared/ShopCard.jsx";
import ProductRow from "@/components/shared/ProductRow.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import { useCategories } from "@/hooks/useCategories";
import { useShops } from "@/hooks/useShops";
import { useLatestProducts, usePopularProducts, useDiscountedProducts } from "@/hooks/useProducts";
import { useBanners } from "@/hooks/useBanners";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Bottom Navigation-এর "🛍️ দোকান" ট্যাব থেকে এলে (#shops হ্যাশ) সরাসরি
  // "জনপ্রিয় দোকানসমূহ" সেকশনে স্মুথ-স্ক্রল করে নিয়ে যাওয়া হয় — এর জন্য
  // আলাদা কোনো নতুন পেজ/রুট বানানো হয়নি, বিদ্যমান হোমপেজ সেকশনই ব্যবহার হচ্ছে।
  useEffect(() => {
    if (location.hash === "#shops") {
      document.getElementById("shops")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const { categories, loading: catLoading } = useCategories({ rootOnly: true });
  const { shops, loading: shopLoading } = useShops({ limit: 6 });
  const { products: latestProducts, loading: latestLoading } = useLatestProducts({ limit: 10 });
  const { products: popularProducts, loading: popularLoading } = usePopularProducts({ limit: 10 });
  const { products: discountedProducts, loading: discountedLoading } = useDiscountedProducts({ limit: 10 });
  const { banners } = useBanners();
  const { settings } = useSiteSettings();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)",
          }}
        />
        <div className="container relative py-16 text-center md:py-24">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent">
            আপনার এলাকার নির্ভরযোগ্য দোকান খুঁজুন
          </p>
          <h1
            className="mx-auto max-w-2xl text-3xl font-bold leading-tight md:text-5xl"
            style={{ fontFamily: "'Tiro Bangla', serif" }}
          >
            স্থানীয় দোকান আর পণ্য —<br className="hidden sm:block" /> এখন সব এক জায়গায়
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/75">
            আপনার পাড়ার প্রিয় দোকানগুলোকে অনলাইনে খুঁজে নিন, পণ্য দেখুন, আর সরাসরি যোগাযোগ করুন।
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="যেমন: শাড়ি, মোবাইল, খাবার..."
                className="h-12 rounded-lg pl-10 text-foreground"
              />
            </div>
            <Button type="submit" size="lg" variant="accent">
              খুঁজুন
            </Button>
          </form>
        </div>
        <div className="kantha-divider" />
      </section>

      {/* Admin Banners (থাকলে) — CMS-driven, snap-scroll carousel */}
      <BannerCarousel banners={banners} />

      {/* Categories — কম্প্যাক্ট horizontal-scroll circle রো (২-সারি) */}
      <section className="container py-8 md:py-10">
        <div className="mb-4">
          <h2 className="text-lg font-bold md:text-xl" style={{ fontFamily: "'Tiro Bangla', serif" }}>
            ক্যাটাগরি অনুযায়ী দেখুন
          </h2>
          <p className="text-xs text-muted-foreground md:text-sm">যা খুঁজছেন তা সহজে বেছে নিন</p>
        </div>

        {catLoading ? (
          <LoadingSpinner label="ক্যাটাগরি লোড হচ্ছে..." />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="এখনো কোনো ক্যাটাগরি যোগ করা হয়নি"
            description="অ্যাডমিন প্যানেল থেকে ক্যাটাগরি যোগ করলে তা এখানে দেখা যাবে।"
          />
        ) : (
          <CategoryChipsRow categories={categories} twoRow={categories.length > 6} />
        )}
      </section>

      {/* জনপ্রিয় পণ্য — sold_count/view_count অনুযায়ী */}
      <ProductRow
        title="জনপ্রিয় পণ্য"
        subtitle="সবচেয়ে বেশি বিক্রি ও দেখা পণ্যগুলো"
        icon={Flame}
        accentClassName="bg-destructive/10 text-destructive"
        products={popularProducts}
        loading={popularLoading}
        emptyIcon={Package}
        emptyTitle="এখনো কোনো জনপ্রিয় পণ্য নেই"
        emptyDescription="পণ্য বিক্রি ও দেখা শুরু হলে এখানে দেখানো হবে।"
      />

      {/* ছাড়ের পণ্য — discount_type সক্রিয় থাকা পণ্য */}
      <ProductRow
        title="চলছে ছাড়"
        subtitle="সীমিত সময়ের জন্য কম দামে পণ্যগুলো"
        icon={BadgePercent}
        accentClassName="bg-accent/15 text-accent"
        products={discountedProducts}
        loading={discountedLoading}
        emptyIcon={Package}
        emptyTitle="এখন কোনো ছাড় চলছে না"
        emptyDescription="সেলাররা ছাড় দিলে পণ্যগুলো এখানে দেখানো হবে।"
      />

      {/* Featured Shops */}
      <section id="shops" className="bg-secondary/40 py-12 md:py-16">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold md:text-2xl" style={{ fontFamily: "'Tiro Bangla', serif" }}>
                জনপ্রিয় দোকানসমূহ
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">নতুন যুক্ত হওয়া বিশ্বস্ত দোকানগুলো দেখুন</p>
            </div>
          </div>

          {shopLoading ? (
            <LoadingSpinner label="দোকান লোড হচ্ছে..." />
          ) : shops.length === 0 ? (
            <EmptyState
              icon={Store}
              title="এখনো কোনো দোকান অনুমোদিত হয়নি"
              description="সেলাররা অনুমোদন পেলে তাদের দোকান এখানে প্রদর্শিত হবে।"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* সাম্প্রতিক পণ্য */}
      <ProductRow
        title="সাম্প্রতিক পণ্য"
        subtitle="সদ্য যুক্ত হওয়া পণ্যগুলো ঘুরে দেখুন"
        icon={Sparkles}
        accentClassName="bg-primary/10 text-primary"
        products={latestProducts}
        loading={latestLoading}
        viewAllTo={ROUTES.SEARCH}
        emptyIcon={Package}
        emptyTitle="এখনো কোনো পণ্য যোগ করা হয়নি"
        emptyDescription="সেলাররা পণ্য যোগ করলে তা এখানে দেখানো হবে।"
      />
    </div>
  );
}
