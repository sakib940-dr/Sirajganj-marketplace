import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Package, Store, MessageCircle } from "lucide-react";
import { useProductBySlug } from "@/hooks/useProducts";
import { formatPriceBn, getDiscountedPrice } from "@/lib/utils";
import { shopPath } from "@/constants/routes";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";

const AUTO_SLIDE_INTERVAL_MS = 4000;

export default function ProductPage() {
  const { productSlug } = useParams();
  const { product, images, loading, error } = useProductBySlug(productSlug);
  const allImages = product
    ? [product.thumbnail_url, ...images.map((i) => i.image_url)].filter(Boolean)
    : [];
  const [activeImage, setActiveImage] = useState(0);

  // একাধিক ছবি থাকলে স্বয়ংক্রিয় ইমেজ স্লাইডার (কয়েক সেকেন্ড পরপর পরবর্তী ছবি দেখাবে)
  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % allImages.length);
    }, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [allImages.length]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  const { hasDiscount, originalPrice, finalPrice, percentOff } = getDiscountedPrice(product);

  if (loading) return <LoadingSpinner fullScreen label="পণ্য লোড হচ্ছে..." />;

  if (error || !product) {
    return (
      <div className="container py-16">
        <EmptyState icon={Package} title="পণ্যটি খুঁজে পাওয়া যায়নি" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-secondary">
            {allImages.length > 0 ? (
              <img src={allImages[activeImage]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Package className="h-10 w-10" />
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.categories?.name && (
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
              {product.categories.name}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
            {product.name}
          </h1>
          {hasDiscount ? (
            <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
              <p className="text-3xl font-bold text-primary">{formatPriceBn(finalPrice)}</p>
              <p className="text-lg text-muted-foreground line-through">{formatPriceBn(originalPrice)}</p>
              <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground">
                {percentOff}% ছাড়
              </span>
            </div>
          ) : (
            <p className="mt-3 text-3xl font-bold text-primary">{formatPriceBn(product.price)}</p>
          )}

          {product.shops?.whatsapp_number && (
            <a
              href={`https://wa.me/${product.shops.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(
                `আমি "${product.name}" পণ্যটি (মূল্য: ${formatPriceBn(finalPrice)}) কিনতে আগ্রহী। এই লিংক থেকে দেখেছি: ${window.location.href}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" />
              হোয়াটসঅ্যাপে কিনুন
            </a>
          )}

          {product.description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {product.description}
            </p>
          )}

          {product.shops?.shop_name && (
            <Link
              to={shopPath(product.shops.slug)}
              className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">বিক্রেতা</span>
                <span className="font-medium text-foreground">{product.shops.shop_name}</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
