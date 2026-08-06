import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Package, Store } from "lucide-react";
import { useProductBySlug } from "@/hooks/useProducts";
import { formatPriceBn } from "@/lib/utils";
import { shopPath } from "@/constants/routes";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";

export default function ProductPage() {
  const { productSlug } = useParams();
  const { product, images, loading, error } = useProductBySlug(productSlug);
  const allImages = product
    ? [product.thumbnail_url, ...images.map((i) => i.image_url)].filter(Boolean)
    : [];
  const [activeImage, setActiveImage] = useState(0);

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
          <p className="mt-3 text-3xl font-bold text-primary">{formatPriceBn(product.price)}</p>

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
