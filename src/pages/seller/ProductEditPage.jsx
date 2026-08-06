import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
};

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

  useEffect(() => {
    async function load() {
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle();
      setShopId(shop?.id ?? null);

      if (isEditing) {
        const { data: existing } = await supabase.from("products").select("*").eq("id", id).single();
        if (existing) setProduct(existing);

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
    if (!shopId) {
      setError("প্রথমে দোকানের তথ্য পূরণ করুন।");
      return;
    }

    setSaving(true);
    const payload = {
      ...product,
      slug: slugify(product.slug),
      price: Number(product.price),
      shop_id: shopId,
      category_id: product.category_id || null,
    };
    delete payload.shops;
    delete payload.categories;

    const { data, error: saveError } = isEditing
      ? await supabase.from("products").update(payload).eq("id", id).select().single()
      : await supabase.from("products").insert(payload).select().single();

    setSaving(false);

    if (saveError) {
      setError(
        saveError.message.includes("duplicate")
          ? "এই লিংক (slug) ইতিমধ্যে ব্যবহৃত হয়েছে। ভিন্ন কিছু দিন।"
          : "সংরক্ষণ ব্যর্থ হয়েছে: " + saveError.message
      );
      return;
    }

    setSaved(true);
    if (!isEditing) {
      navigate(`/dashboard/products/${data.id}/edit`, { replace: true });
    }
    setTimeout(() => setSaved(false), 3000);
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">প্রধান ছবি</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket="product-images"
              folder={user.id}
              value={product.thumbnail_url}
              onUploaded={(url) => update("thumbnail_url", url)}
            />
          </CardContent>
        </Card>

        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">আরও ছবি (ঐচ্ছিক)</CardTitle>
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
              {extraImages.length < 4 && (
                <ImageUploader bucket="product-images" folder={user.id} value="" onUploaded={addExtraImage} />
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
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} size="lg">
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
