import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { slugify, formatPriceBn, getDiscountedPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ImageUploader from "@/components/shared/ImageUploader.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import { ROUTES } from "@/constants/routes";

const EMPTY_PRODUCT = {
  name: "",
  slug: "",
  category_id: "",
  price: "",
  description: "",
  thumbnail_url: "",
  is_active: true,
  discount_type: "none",
  discount_value: "",
};

const PRODUCT_IMAGE_MAX_KB = 200;
const MAX_PRODUCTS_PER_SHOP = 50;
const MAX_EXTRA_IMAGES = 3; // + ১টি মূল ছবি = সর্বোচ্চ ৪টি

export default function ProductEditPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories } = useCategories();

  const [shopId, setShopId] = useState(null);
  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [extraImages, setExtraImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);

  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle();
      setShopId(shop?.id ?? null);

      if (shop?.id && !isEditing) {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("shop_id", shop.id);
        setProductCount(count ?? 0);
      }

      if (isEditing) {
        const { data: existing } = await supabase.from("products").select("*").eq("id", id).single();
        if (existing) setProduct({ ...EMPTY_PRODUCT, ...existing, discount_value: existing.discount_value ?? "" });

        const { data: imgs } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", id)
          .order("sort_order", { ascending: true });
        setExtraImages(imgs ?? []);
      }
      setLoading(false);
    }
    if (user) load();
  }, [user, id, isEditing]);

  // ক্যাটাগরি ও সাব-ক্যাটাগরি আলাদা করে গ্রুপ করা হচ্ছে (dropdown-এ দেখানোর জন্য)
  const rootCategories = categories.filter((c) => !c.parent_id);
  const childCategoriesByParent = categories.reduce((acc, c) => {
    if (c.parent_id) {
      acc[c.parent_id] = acc[c.parent_id] || [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  const update = (field, value) => setProduct((prev) => ({ ...prev, [field]: value }));

  const handleNameChange = (value) => {
    update("name", value);
    if (!slugManuallyEdited) update("slug", slugify(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!product.name.trim() || !product.slug.trim() || !product.price) {
      setError("পণ্যের নাম, লিংক (slug) এবং মূল্য অবশ্যই দিতে হবে।");
      return;
    }
    if (!product.thumbnail_url) {
      setError("কমপক্ষে ১টি পণ্যের ছবি আবশ্যক (সর্বোচ্চ ৪টি পর্যন্ত দেওয়া যাবে)।");
      return;
    }
    if (product.discount_type !== "none" && (!product.discount_value || Number(product.discount_value) <= 0)) {
      setError("ডিসকাউন্টের ধরন নির্বাচন করলে ডিসকাউন্টের পরিমাণও দিতে হবে।");
      return;
    }
    if (product.discount_type === "percentage" && Number(product.discount_value) > 100) {
      setError("শতাংশ ডিসকাউন্ট ১০০%-এর বেশি হতে পারবে না।");
      return;
    }
    if (!shopId) {
      setError("প্রথমে দোকানের তথ্য পূরণ করুন।");
      return;
    }
    if (!isEditing && productCount >= MAX_PRODUCTS_PER_SHOP) {
      setError(`একটি দোকান সর্বোচ্চ ${MAX_PRODUCTS_PER_SHOP}টি পণ্য যোগ করতে পারবে।`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...product,
        slug: slugify(product.slug),
        price: Number(product.price),
        shop_id: shopId,
        category_id: product.category_id || null,
        discount_type: product.discount_type || "none",
        discount_value: product.discount_type === "none" ? 0 : Number(product.discount_value) || 0,
      };
      delete payload.shops;
      delete payload.categories;

      const { data, error: saveError } = isEditing
        ? await supabase.from("products").update(payload).eq("id", id).select().single()
        : await supabase.from("products").insert(payload).select().single();

      if (saveError) {
        if (saveError.message.includes("duplicate")) {
          setError("এই লিংক (slug) ইতিমধ্যে ব্যবহৃত হয়েছে। ভিন্ন কিছু দিন।");
        } else if (saveError.message.toLowerCase().includes("row-level security")) {
          setError(
            "অনুমতি নেই — আপনার সেলার অ্যাকাউন্ট এখনো Approved হয়নি, অথবা এই দোকান আপনার নয়।"
          );
        } else if (saveError.message.includes("সর্বোচ্চ ৫০টি পণ্য")) {
          setError(saveError.message);
        } else {
          setError("সংরক্ষণ ব্যর্থ হয়েছে: " + saveError.message);
        }
        return;
      }

      setSaved(true);
      if (!isEditing) {
        navigate(`/dashboard/products/${data.id}/edit`, { replace: true });
      }
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Product save error:", err);
      setError("একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  const addExtraImage = async (url) => {
    if (!url || !isEditing) return;
    const { data } = await supabase
      .from("product_images")
      .insert({ product_id: id, image_url: url, sort_order: extraImages.length })
      .select()
      .single();
    if (data) setExtraImages((prev) => [...prev, data]);
  };

  const removeExtraImage = async (imgId) => {
    await supabase.from("product_images").delete().eq("id", imgId);
    setExtraImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  if (loading) return <LoadingSpinner label="লোড হচ্ছে..." />;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
        {isEditing ? "পণ্য এডিট করুন" : "নতুন পণ্য যোগ করুন"}
      </h1>

      {!isEditing && productCount >= MAX_PRODUCTS_PER_SHOP && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          আপনার দোকানে ইতিমধ্যে {MAX_PRODUCTS_PER_SHOP}টি পণ্য যোগ করা হয়েছে — সর্বোচ্চ সীমায় পৌঁছে গেছেন। নতুন পণ্য যোগ করতে হলে আগে কিছু পণ্য মুছুন।
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">প্রধান ছবি *</CardTitle>
            <CardDescription>সর্বোচ্চ {PRODUCT_IMAGE_MAX_KB} KB সাইজের ছবি — প্রতিটি পণ্যে ১টি থেকে ৪টি ছবি দেওয়া যাবে</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket="product-images"
              folder={user.id}
              value={product.thumbnail_url}
              onUploaded={(url) => update("thumbnail_url", url)}
              maxSizeKB={PRODUCT_IMAGE_MAX_KB}
            />
          </CardContent>
        </Card>

        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">আরও ছবি (ঐচ্ছিক, সর্বোচ্চ {MAX_EXTRA_IMAGES}টি)</CardTitle>
              <CardDescription>একাধিক ছবি দিলে ভিজিটররা পণ্যের পেজে স্বয়ংক্রিয় স্লাইডারে দেখতে পাবেন</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {extraImages.map((img) => (
                <div key={img.id} className="relative h-28 w-28 overflow-hidden rounded-xl border border-border">
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExtraImage(img.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {extraImages.length < MAX_EXTRA_IMAGES && (
                <ImageUploader
                  bucket="product-images"
                  folder={user.id}
                  value=""
                  onUploaded={addExtraImage}
                  maxSizeKB={PRODUCT_IMAGE_MAX_KB}
                />
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">পণ্যের তথ্য</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">পণ্যের নাম *</Label>
              <Input id="name" required value={product.name} onChange={(e) => handleNameChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">লিংক (slug) *</Label>
              <Input
                id="slug"
                required
                value={product.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  update("slug", e.target.value);
                }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">মূল্য (টাকা) *</Label>
                <Input id="price" type="number" min="0" required value={product.price} onChange={(e) => update("price", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category_id">ক্যাটাগরি</Label>
                <select
                  id="category_id"
                  value={product.category_id || ""}
                  onChange={(e) => update("category_id", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">নির্বাচন করুন</option>
                  {rootCategories.map((c) => (
                    <optgroup key={c.id} label={c.name}>
                      <option value={c.id}>{c.name} (সাধারণ)</option>
                      {(childCategoriesByParent[c.id] || []).map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          &nbsp;&nbsp;— {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">বিবরণ</Label>
              <textarea
                id="description"
                rows={4}
                value={product.description || ""}
                onChange={(e) => update("description", e.target.value)}
                className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ডিসকাউন্ট (ঐচ্ছিক)</CardTitle>
            <CardDescription>নির্দিষ্ট পরিমাণ টাকা অথবা শতাংশ হারে ছাড় দিতে পারবেন</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="discount_type">ডিসকাউন্টের ধরন</Label>
              <select
                id="discount_type"
                value={product.discount_type || "none"}
                onChange={(e) => update("discount_type", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="none">কোনো ডিসকাউন্ট নেই</option>
                <option value="fixed">নির্দিষ্ট পরিমাণ (৳)</option>
                <option value="percentage">শতাংশ (%)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discount_value">
                ডিসকাউন্টের পরিমাণ {product.discount_type === "percentage" ? "(%)" : "(৳)"}
              </Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                max={product.discount_type === "percentage" ? 100 : undefined}
                disabled={product.discount_type === "none"}
                value={product.discount_value}
                onChange={(e) => update("discount_value", e.target.value)}
              />
            </div>
            {product.discount_type !== "none" && product.price && product.discount_value && (
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                ছাড়ের পর মূল্য: <span className="font-medium text-primary">{formatPriceBn(getDiscountedPrice({ ...product, price: Number(product.price) }).finalPrice)}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving || (!isEditing && productCount >= MAX_PRODUCTS_PER_SHOP)} size="lg">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "সংরক্ষণ হচ্ছে..." : saved ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ করুন"}
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to={ROUTES.DASHBOARD_PRODUCTS}>বাতিল</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
