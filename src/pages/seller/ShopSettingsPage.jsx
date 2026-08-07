import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Save, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { slugify } from "@/lib/utils";
import { shopPath } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ImageUploader from "@/components/shared/ImageUploader.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";

const EMPTY_SHOP = {
  shop_name: "",
  slug: "",
  logo_url: "",
  banner_url: "",
  about: "",
  phone: "",
  whatsapp_number: "",
  address: "",
  google_map_link: "",
  facebook_link: "",
};

export default function ShopSettingsPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState(EMPTY_SHOP);
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("shops")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setShop(data);
          setShopId(data.id);
          setSlugManuallyEdited(true);
        }
        setLoading(false);
      });
  }, [user]);

  const update = (field, value) => setShop((prev) => ({ ...prev, [field]: value }));

  const handleNameChange = (value) => {
    update("shop_name", value);
    if (!slugManuallyEdited) {
      update("slug", slugify(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!shop.shop_name.trim() || !shop.slug.trim()) {
      setError("দোকানের নাম ও লিংক (slug) অবশ্যই দিতে হবে।");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...shop, owner_id: user.id, slug: slugify(shop.slug) };

      const { data, error: saveError } = shopId
        ? await supabase.from("shops").update(payload).eq("id", shopId).select().single()
        : await supabase.from("shops").insert(payload).select().single();

      if (saveError) {
        if (saveError.message.includes("duplicate")) {
          setError("এই লিংক (slug) ইতিমধ্যে অন্য একটি দোকান ব্যবহার করছে। ভিন্ন কিছু দিন।");
        } else if (saveError.message.toLowerCase().includes("row-level security")) {
          setError(
            "অনুমতি নেই — নতুন দোকান তৈরি করতে হলে আপনার সেলার অ্যাকাউন্ট Super Admin দ্বারা Approved হতে হবে।"
          );
        } else {
          setError("সংরক্ষণ ব্যর্থ হয়েছে: " + saveError.message);
        }
        return;
      }

      setShop(data);
      setShopId(data.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Shop save error:", err);
      setError("একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="তথ্য লোড হচ্ছে..." />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          দোকানের তথ্য
        </h1>
        <p className="text-sm text-muted-foreground">এই তথ্য থেকে আপনার দোকানের পাবলিক পেজ স্বয়ংক্রিয়ভাবে তৈরি হবে</p>
      </div>

      {shopId && (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-secondary/60 p-4 text-sm">
          <span>
            আপনার দোকানের লিংক: <span className="font-medium text-primary">/shop/{shop.slug}</span>
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link to={shopPath(shop.slug)} target="_blank">
              দেখুন <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">লোগো ও ব্যানার</CardTitle>
            <CardDescription>লোগো বর্গাকার, ব্যানার চওড়া ছবি হলে ভালো দেখাবে</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            <div>
              <Label className="mb-2 block">দোকানের লোগো</Label>
              <ImageUploader
                bucket="shop-logos"
                folder={user.id}
                value={shop.logo_url}
                onUploaded={(url) => update("logo_url", url)}
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <Label className="mb-2 block">ব্যানার</Label>
              <ImageUploader
                bucket="shop-banners"
                folder={user.id}
                value={shop.banner_url}
                onUploaded={(url) => update("banner_url", url)}
                aspect="wide"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">মূল তথ্য</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="shop_name">দোকানের নাম *</Label>
              <Input id="shop_name" required value={shop.shop_name} onChange={(e) => handleNameChange(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">দোকানের লিংক (slug) *</Label>
              <Input
                id="slug"
                required
                value={shop.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  update("slug", e.target.value);
                }}
              />
              <p className="text-xs text-muted-foreground">আপনার শপ পেজ হবে: /shop/{shop.slug || "আপনার-লিংক"}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="about">দোকান সম্পর্কে</Label>
              <textarea
                id="about"
                rows={3}
                value={shop.about || ""}
                onChange={(e) => update("about", e.target.value)}
                className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">যোগাযোগ ও ঠিকানা</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">ফোন নম্বর</Label>
                <Input id="phone" value={shop.phone || ""} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp_number">হোয়াটসঅ্যাপ নম্বর</Label>
                <Input
                  id="whatsapp_number"
                  placeholder="8801XXXXXXXXX"
                  value={shop.whatsapp_number || ""}
                  onChange={(e) => update("whatsapp_number", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">ঠিকানা</Label>
              <Input id="address" value={shop.address || ""} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="google_map_link">Google Map লিংক</Label>
              <Input id="google_map_link" value={shop.google_map_link || ""} onChange={(e) => update("google_map_link", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="facebook_link">ফেসবুক পেজ লিংক</Label>
              <Input id="facebook_link" value={shop.facebook_link || ""} onChange={(e) => update("facebook_link", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving} size="lg">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "সংরক্ষণ হচ্ছে..." : saved ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ করুন"}
        </Button>
      </form>
    </div>
  );
}
