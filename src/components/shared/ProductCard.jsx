import { Link } from "react-router-dom";
import { Package, Store } from "lucide-react";
import { productPath } from "@/constants/routes";
import { formatPriceBn, getDiscountedPrice, cn } from "@/lib/utils";

/**
 * কম্প্যাক্ট, তথ্যবহুল প্রোডাক্ট কার্ড — গ্রিডে (৩/৪ কলাম) এবং
 * horizontal-scroll রো (ProductRow) — দুই জায়গাতেই ব্যবহারযোগ্য।
 * রো-তে ব্যবহারের সময় `className`-এ ফিক্সড width (যেমন w-36 shrink-0) দিন।
 */
export default function ProductCard({ product, className }) {
  const { hasDiscount, originalPrice, finalPrice, percentOff } = getDiscountedPrice(product);
  const shopName = product.shops?.shop_name;

  return (
    <Link
      to={productPath(product.slug)}
      className={cn(
        "group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-square w-full bg-secondary">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-8 w-8" />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground shadow-sm">
            -{percentOff}%
          </span>
        )}

        {!hasDiscount && product.stock_quantity === 0 && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/70 px-2 py-1 text-center text-[10px] font-semibold text-background">
            স্টক শেষ
          </span>
        )}
      </div>

      <div className="space-y-1 p-2.5">
        <h3 className="line-clamp-2 min-h-[2.25em] text-[13px] font-medium leading-tight text-foreground group-hover:text-primary">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-primary">{formatPriceBn(finalPrice)}</span>
          {hasDiscount && (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatPriceBn(originalPrice)}
            </span>
          )}
        </div>

        {shopName && (
          <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <Store className="h-3 w-3 shrink-0" />
            <span className="truncate">{shopName}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
