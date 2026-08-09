import { useParams } from "react-router-dom";
import { Package, Flame, BadgePercent, Sparkles } from "lucide-react";
import { useLatestProducts, usePopularProducts, useDiscountedProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/shared/ProductCard.jsx";
import ProductGridSkeleton from "@/components/shared/ProductGridSkeleton.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";

// হোমপেজে "জনপ্রিয় পণ্য", "চলছে ছাড়", "সাম্প্রতিক পণ্য" — এই তিনটা
// horizontal-scroll সেকশনের "সব দেখুন"-এ ক্লিক করলে আগে "সাম্প্রতিক পণ্য"
// ভুলভাবে সার্চ পেজে (খালি রেজাল্ট) পাঠাতো, আর বাকি দুটোতে "সব দেখুন"
// বাটনই ছিল না। এখন তিনটাই এই একটামাত্র জেনেরিক পেজে আসবে, যা
// CategoryPage-এর মতো ভার্টিক্যালি স্ক্রলযোগ্য গ্রিডে সবগুলো পণ্য দেখাবে —
// কোনো সার্চ ইনভলভ থাকবে না।
const SECTION_CONFIG = {
  popular: {
    title: "জনপ্রিয় পণ্য",
    subtitle: "সবচেয়ে বেশি বিক্রি ও দেখা পণ্যগুলো",
    icon: Flame,
    useHook: usePopularProducts,
    emptyTitle: "এখনো কোনো জনপ্রিয় পণ্য নেই",
    emptyDescription: "পণ্য বিক্রি ও দেখা শুরু হলে এখানে দেখানো হবে।",
  },
  discounted: {
    title: "চলছে ছাড়",
    subtitle: "সীমিত সময়ের জন্য কম দামে পণ্যগুলো",
    icon: BadgePercent,
    useHook: useDiscountedProducts,
    emptyTitle: "এখন কোনো ছাড় চলছে না",
    emptyDescription: "সেলাররা ছাড় দিলে পণ্যগুলো এখানে দেখানো হবে।",
  },
  latest: {
    title: "সাম্প্রতিক পণ্য",
    subtitle: "সদ্য যুক্ত হওয়া পণ্যগুলো ঘুরে দেখুন",
    icon: Sparkles,
    useHook: useLatestProducts,
    emptyTitle: "এখনো কোনো পণ্য যোগ করা হয়নি",
    emptyDescription: "সেলাররা পণ্য যোগ করলে তা এখানে দেখানো হবে।",
  },
};

// হোমপেজের রো-তে ১০টা পর্যন্ত দেখানো হয় বলেই সীমাবদ্ধ থাকে — এই "সব দেখুন"
// পেজে অনেক বেশি (১০০টা পর্যন্ত) লোড করা হচ্ছে যাতে আসলেই "সব" দেখা যায়।
const FULL_LIST_LIMIT = 100;

export default function ProductListSectionPage() {
  const { section } = useParams();
  const config = SECTION_CONFIG[section] ?? SECTION_CONFIG.latest;
  const { products, loading } = config.useHook({ limit: FULL_LIST_LIMIT });
  const Icon = config.icon;

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
            {config.title}
          </h1>
          <p className="text-xs text-muted-foreground md:text-sm">{config.subtitle}</p>
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title={config.emptyTitle} description={config.emptyDescription} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
