import { useEffect, useState } from "react";
import { X, Images } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import ImageUploader from "@/components/shared/ImageUploader.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";

export default function GalleryPage() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle();
      if (!shop) {
        setLoading(false);
        return;
      }
      setShopId(shop.id);
      const { data } = await supabase
        .from("shop_gallery")
        .select("*")
        .eq("shop_id", shop.id)
        .order("sort_order", { ascending: true });
      setImages(data ?? []);
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  const addImage = async (url) => {
    if (!url || !shopId) return;
    const { data } = await supabase
      .from("shop_gallery")
      .insert({ shop_id: shopId, image_url: url, sort_order: images.length })
      .select()
      .single();
    if (data) setImages((prev) => [...prev, data]);
  };

  const removeImage = async (id) => {
    await supabase.from("shop_gallery").delete().eq("id", id);
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <LoadingSpinner label="লোড হচ্ছে..." />;

  if (!shopId) {
    return <EmptyState icon={Images} title="প্রথমে দোকানের তথ্য পূরণ করুন" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          দোকানের গ্যালারি
        </h1>
        <p className="text-sm text-muted-foreground">আপনার দোকান/পণ্যের অতিরিক্ত ছবি এখানে যোগ করুন</p>
      </div>

      <div className="flex flex-wrap gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative h-28 w-28 overflow-hidden rounded-xl border border-border">
            <img src={img.image_url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(img.id)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <ImageUploader bucket="shop-gallery" folder={user.id} value="" onUploaded={addImage} />
      </div>
    </div>
  );
}
