import { useEffect, useState } from "react";
import { Plus, Trash2, X, GalleryHorizontal, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/shared/ImageUploader.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";

const EMPTY = { title: "", image_url: "", link_url: "", sort_order: 0, is_active: true };

export default function BannerManagePage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
    setBanners(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.image_url) {
      setError("ব্যানারের ছবি আপলোড করুন।");
      return;
    }
    setSaving(true);
    const { error: saveError } = await supabase.from("banners").insert({
      ...form,
      sort_order: Number(form.sort_order) || 0,
    });
    setSaving(false);
    if (saveError) {
      setError("সংরক্ষণ ব্যর্থ হয়েছে: " + saveError.message);
      return;
    }
    setForm(EMPTY);
    setShowForm(false);
    load();
  };

  const toggleActive = async (banner) => {
    await supabase.from("banners").update({ is_active: !banner.is_active }).eq("id", banner.id);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("এই ব্যানারটি মুছে ফেলতে চান?")) return;
    await supabase.from("banners").delete().eq("id", id);
    load();
  };

  if (loading) return <LoadingSpinner label="লোড হচ্ছে..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          হোমপেজ ব্যানার
        </h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "বাতিল" : "নতুন ব্যানার"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div>
            <Label className="mb-2 block">ব্যানার ছবি *</Label>
            <ImageUploader
              bucket="site-assets"
              folder="banners"
              value={form.image_url}
              onUploaded={(url) => setForm((f) => ({ ...f, image_url: url }))}
              aspect="wide"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="banner_title">শিরোনাম (ঐচ্ছিক)</Label>
              <Input id="banner_title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="banner_link">লিংক (ঐচ্ছিক)</Label>
              <Input id="banner_link" value={form.link_url} onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </Button>
        </form>
      )}

      {banners.length === 0 ? (
        <EmptyState icon={GalleryHorizontal} title="এখনো কোনো ব্যানার যোগ করা হয়নি" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <img src={b.image_url} alt={b.title || ""} className="h-32 w-full object-cover" />
              <div className="flex items-center justify-between p-3">
                <span className="truncate text-sm font-medium">{b.title || "শিরোনামহীন"}</span>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(b)}>
                    {b.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
