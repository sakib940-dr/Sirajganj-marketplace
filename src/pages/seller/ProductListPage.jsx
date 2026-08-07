import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Package, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import PendingApprovalNotice from "@/components/seller/PendingApprovalNotice.jsx";
import { ROUTES, editProductPath } from "@/constants/routes";
import { formatPriceBn, getDiscountedPrice } from "@/lib/utils";
import { ROLES, SELLER_STATUS, isAdminOrAbove } from "@/constants/roles";

const MAX_PRODUCTS_PER_SHOP = 50;

export default function ProductListPage() {
  const { user, role, sellerStatus } = useAuth();
  const isApprovedSeller =
    isAdminOrAbove(role) || (role === ROLES.SELLER && sellerStatus === SELLER_STATUS.APPROVED);
  const [products, setProducts] = useState([]);
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle();
    if (!shop) {
      setShopId(null);
      setProducts([]);
      setLoading(false);
      return;
    }
    setShopId(shop.id);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && isApprovedSeller) load();
    else setLoading(false);
  }, [user, load, isApprovedSeller]);

  const toggleActive = async (product) => {
    setBusyId(product.id);
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);
    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      );
    }
    setBusyId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিত এই পণ্যটি মুছে ফেলতে চান?")) return;
    setBusyId(id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProducts((prev) => prev.filter((p) => p.id !== id));
    setBusyId(null);
  };

  if (!isApprovedSeller) return <PendingApprovalNotice status={sellerStatus} />;

  if (loading) return <LoadingSpinner label="পণ্য লোড হচ্ছে..." />;

  if (!shopId) {
    return (
      <EmptyState
        icon={Package}
        title="প্রথমে আপনার দোকানের তথ্য পূরণ করুন"
        description="পণ্য যোগ করার আগে দোকানের তথ্য সংরক্ষণ করা প্রয়োজন।"
        action={
          <Button asChild>
            <Link to={ROUTES.DASHBOARD_SHOP}>দোকানের তথ্য পূরণ করুন</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
            পণ্যসমূহ
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {products.length} / {MAX_PRODUCTS_PER_SHOP}টি পণ্য যোগ করা হয়েছে
          </p>
        </div>
        <Button asChild size="sm" disabled={products.length >= MAX_PRODUCTS_PER_SHOP}>
          <Link
            to={ROUTES.DASHBOARD_PRODUCT_NEW}
            onClick={(e) => products.length >= MAX_PRODUCTS_PER_SHOP && e.preventDefault()}
          >
            <Plus className="h-4 w-4" /> নতুন পণ্য
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="এখনো কোনো পণ্য যোগ করা হয়নি"
          action={
            <Button asChild size="sm">
              <Link to={ROUTES.DASHBOARD_PRODUCT_NEW}>
                <Plus className="h-4 w-4" /> প্রথম পণ্য যোগ করুন
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50 text-left">
              <tr>
                <th className="p-3 font-medium">পণ্য</th>
                <th className="p-3 font-medium">মূল্য</th>
                <th className="p-3 font-medium">স্টক / বিক্রি</th>
                <th className="p-3 font-medium">অবস্থা</th>
                <th className="p-3 font-medium">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="flex items-center gap-3 p-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {p.thumbnail_url && (
                        <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="line-clamp-1 font-medium">{p.name}</span>
                  </td>
                  <td className="p-3">
                    {getDiscountedPrice(p).hasDiscount ? (
                      <span className="flex items-center gap-1.5">
                        <span className="font-medium">{formatPriceBn(getDiscountedPrice(p).finalPrice)}</span>
                        <span className="text-xs text-muted-foreground line-through">{formatPriceBn(p.price)}</span>
                      </span>
                    ) : (
                      formatPriceBn(p.price)
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span
                        className={
                          Number(p.stock_quantity ?? 0) <= 0
                            ? "font-medium text-destructive"
                            : "font-medium text-foreground"
                        }
                      >
                        স্টক: {p.stock_quantity ?? 0}
                      </span>
                      <span className="text-muted-foreground">বিক্রি: {p.sold_count ?? 0}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="icon" disabled={busyId === p.id} onClick={() => toggleActive(p)} title={p.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}>
                        {p.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={editProductPath(p.id)} title="এডিট করুন">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" disabled={busyId === p.id} onClick={() => handleDelete(p.id)} title="মুছুন">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
