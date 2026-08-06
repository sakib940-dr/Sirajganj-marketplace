import { Link } from "react-router-dom";
import { Store, MapPin } from "lucide-react";
import { shopPath } from "@/constants/routes";

export default function ShopCard({ shop }) {
  return (
    <Link
      to={shopPath(shop.slug)}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="h-24 w-full bg-secondary">
        {shop.banner_url && (
          <img src={shop.banner_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex items-start gap-3 p-4">
        <div className="-mt-8 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-card bg-primary text-primary-foreground shadow-sm">
          {shop.logo_url ? (
            <img src={shop.logo_url} alt={shop.shop_name} className="h-full w-full object-cover" />
          ) : (
            <Store className="h-6 w-6" />
          )}
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="truncate font-semibold text-foreground group-hover:text-primary">
            {shop.shop_name}
          </h3>
          {shop.address && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {shop.address}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
