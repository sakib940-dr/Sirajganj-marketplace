import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { productPath } from "@/constants/routes";
import { formatPriceBn } from "@/lib/utils";

export default function ProductCard({ product }) {
  return (
    <Link
      to={productPath(product.slug)}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-square w-full bg-secondary">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-1 font-semibold text-primary">{formatPriceBn(product.price)}</p>
        {product.shops?.shop_name && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{product.shops.shop_name}</p>
        )}
      </div>
    </Link>
  );
}
