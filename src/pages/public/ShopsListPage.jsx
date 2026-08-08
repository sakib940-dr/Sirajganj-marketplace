import { useMemo, useState } from "react";
import { Search, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import ShopCard from "@/components/shared/ShopCard.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import { useShops } from "@/hooks/useShops";

// Bottom Navigation-এর "দোকান" ট্যাব থেকে সরাসরি এখানে আসা যায় — সব
// অনুমোদিত/সক্রিয় দোকানের সম্পূর্ণ তালিকা এখানে দেখানো হয় (হোমপেজে শুধু
// সীমিত ৬টা দেখানো হয়)। বিদ্যমান useShops হুক-ই (limit ছাড়া কল করলে
// স্বয়ংক্রিয়ভাবে সব দোকান রিটার্ন করে) reuse করা হয়েছে — নতুন
// query/backend পরিবর্তন লাগেনি।
export default function ShopsListPage() {
  const { shops, loading } = useShops();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (shop) =>
        shop.shop_name?.toLowerCase().includes(q) || shop.address?.toLowerCase().includes(q)
    );
  }, [shops, query]);

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-5">
        <h1
          className="text-xl font-bold md:text-2xl"
          style={{ fontFamily: "'Tiro Bangla', serif" }}
        >
          সব দোকান
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          এই মার্কেটপ্লেসের সকল অনুমোদিত দোকান এখানে দেখুন
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="দোকানের নাম বা এলাকা দিয়ে খুঁজুন..."
          className="h-11 rounded-full border-border/80 bg-secondary/40 pl-10 shadow-none focus-visible:bg-background"
        />
      </div>

      {loading ? (
        <LoadingSpinner label="দোকান লোড হচ্ছে..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title={query ? "কোনো দোকান পাওয়া যায়নি" : "এখনো কোনো দোকান অনুমোদিত হয়নি"}
          description={
            query
              ? "অন্য কোনো নাম বা এলাকা দিয়ে খুঁজে দেখুন।"
              : "সেলাররা অনুমোদন পেলে তাদের দোকান এখানে প্রদর্শিত হবে।"
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
