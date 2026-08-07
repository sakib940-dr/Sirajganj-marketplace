import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowLeft, Tag, Store, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/shared/CategoryCard.jsx";
import ShopCard from "@/components/shared/ShopCard.jsx";
import ProductCard from "@/components/shared/ProductCard.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import { useCategories } from "@/hooks/useCategories";
import { useShops } from "@/hooks/useShops";
import { useLatestProducts } from "@/hooks/useProducts";
import { useBanners } from "@/hooks/useBanners";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { categories, loading: catLoading } = useCategories({ rootOnly: true });
  const { shops, loading: shopLoading } = useShops({ limit: 6 });
  const { products, loading: productLoading } = useLatestProducts({ limit: 8 });
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

      {/* Admin Banners (থাকলে) */}
      {banners.length > 0 && (
        <section className="container -mt-8 relative z-10">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {banners.map((banner) =>
              banner.link_url ? (
                <a
                  key={banner.id}
                  href={banner.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block h-36 w-full shrink-0 snap-center overflow-hidden rounded-xl border border-border shadow-md sm:h-44"
                >
                  <img src={banner.image_url} alt={banner.title || ""} className="h-full w-full object-cover" />
                </a>
              ) : (
                <div
                  key={banner.id}
                  className="h-36 w-full shrink-0 snap-center overflow-hidden rounded-xl border border-border shadow-md sm:h-44"
                >
                  <img src={banner.image_url} alt={banner.title || ""} className="h-full w-full object-cover" />
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container py-12 md:py-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold md:text-2xl" style={{ fontFamily: "'Tiro Bangla', serif" }}>
              ক্যাটাগরি অনুযায়ী দেখুন
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">যা খুঁজছেন তা সহজে বেছে নিন</p>
          </div>
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
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Shops */}
      <section className="bg-secondary/40 py-12 md:py-16">
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

      {/* Latest Products */}
      <section className="container py-12 md:py-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold md:text-2xl" style={{ fontFamily: "'Tiro Bangla', serif" }}>
              সাম্প্রতিক পণ্য
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">সদ্য যুক্ত হওয়া পণ্যগুলো ঘুরে দেখুন</p>
          </div>
          <Link to={ROUTES.SEARCH} className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex">
            সব দেখুন <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>

        {productLoading ? (
          <LoadingSpinner label="পণ্য লোড হচ্ছে..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="এখনো কোনো পণ্য যোগ করা হয়নি"
            description="সেলাররা পণ্য যোগ করলে তা এখানে দেখানো হবে।"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
