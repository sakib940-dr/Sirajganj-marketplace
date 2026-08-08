import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Package, Store, Heart } from "lucide-react";
import { useProductBySlug, useRelatedProducts } from "@/hooks/useProducts";
import { formatPriceBn, getDiscountedPrice } from "@/lib/utils";
import { shopPath } from "@/constants/routes";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import ProductCard from "@/components/shared/ProductCard.jsx";
import CurrentViewersBadge from "@/components/shared/CurrentViewersBadge.jsx";
import OrderNowMenu from "@/components/shared/OrderNowMenu.jsx";
import { trackProductView, trackProductOrderClick, useProductSave } from "@/hooks/useProductAnalytics";

const AUTO_SLIDE_INTERVAL_MS = 4000;

export default function ProductPage() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { product, images, loading, error } = useProductBySlug(productSlug);
  const allImages = product
    ? [product.thumbnail_url, ...images.map((i) => i.image_url)].filter(Boolean)
    : [];
  const [activeImage, setActiveImage] = useState(0);
  const { isSaved, saving, toggleSave } = useProductSave(product?.id);
  const { products: relatedProducts } = useRelatedProducts(product?.category_id, product?.id);
  const viewedProductIds = useRef(new Set());

  // পণ্যের পেজ লোড হলে একবার ভিউ কাউন্ট বাড়ানো হয় (একই পণ্যের জন্য বারবার নয়)
  useEffect(() => {
    if (!product?.id || viewedProductIds.current.has(product.id)) return;
    viewedProductIds.current.add(product.id);
    trackProductView(product.id);
  }, [product?.id]);

  const handleSaveClick = async () => {
    const { requiresLogin } = await toggleSave();
    if (requiresLogin) {
      navigate("/login");
    }
  };

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
          <div className="mt-2">
            <CurrentViewersBadge productId={product.id} />
          </div>
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

          {(() => {
            const shop = product.shops;
            const whatsappMessage = `আমি "${product.name}" পণ্যটি (মূল্য: ${formatPriceBn(finalPrice)}) কিনতে আগ্রহী। এই লিংক থেকে দেখেছি: ${window.location.href}`;

            return (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <OrderNowMenu
                  shop={shop}
                  whatsappMessage={whatsappMessage}
                  onOrderClick={() => trackProductOrderClick(product.id)}
                />
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={saving}
                  aria-pressed={isSaved}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
                    isSaved
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border bg-card text-muted-foreground hover:text-destructive"
                  }`}
                  title={isSaved ? "সেভ করা তালিকা থেকে সরান" : "পণ্যটি সেভ করুন"}
                >
                  <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                </button>
              </div>
            );
          })()}

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

      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
            সম্পর্কিত পণ্য
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
