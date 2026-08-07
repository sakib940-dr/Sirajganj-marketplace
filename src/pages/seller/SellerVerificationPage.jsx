import { useEffect, useState } from "react";
import { Save, Check, Clock, XCircle, BadgeCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ImageUploader from "@/components/shared/ImageUploader.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import { VERIFICATION_STATUS, VERIFICATION_STATUS_LABEL_BN } from "@/constants/roles";

const EMPTY_VERIFICATION = {
  full_name: "",
  profile_photo_url: "",
  phone: "",
  address: "",
  google_map_link: "",
  facebook_link: "",
  nid_number: "",
  nid_front_url: "",
  nid_back_url: "",
};

const PROFILE_PHOTO_MAX_KB = 2048; // ২ MB
const NID_IMAGE_MAX_KB = 500;

export default function SellerVerificationPage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(EMPTY_VERIFICATION);
  const [status, setStatus] = useState(null); // null মানে এখনো আবেদন করা হয়নি
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("seller_verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({ ...EMPTY_VERIFICATION, ...data });
          setStatus(data.status);
        } else {
          setForm((f) => ({ ...f, full_name: profile?.full_name || "", phone: profile?.phone || "" }));
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (
      !form.full_name.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.nid_number.trim() ||
      !form.nid_front_url ||
      !form.nid_back_url
    ) {
      setError("পুরো নাম, ফোন নম্বর, ঠিকানা, NID নম্বর এবং NID-এর দুই পাশের ছবি অবশ্যই দিতে হবে।");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, user_id: user.id };
      delete payload.id;
      delete payload.status;
      delete payload.admin_note;
      delete payload.created_at;
      delete payload.updated_at;

      const { data, error: saveError } = await supabase
        .from("seller_verifications")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (saveError) {
        setError("সংরক্ষণ ব্যর্থ হয়েছে: " + saveError.message);
        return;
      }

      setForm({ ...EMPTY_VERIFICATION, ...data });
      setStatus(data.status);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Verification save error:", err);
      setError("একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="তথ্য লোড হচ্ছে..." />;

  const isApproved = status === VERIFICATION_STATUS.APPROVED;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          সেলার ভেরিফিকেশন
        </h1>
        <p className="text-sm text-muted-foreground">
          ক্রেতাদের আস্থা বাড়াতে আপনার পরিচয় যাচাই করুন। Super Admin আপনার তথ্য পর্যালোচনা করবেন।
        </p>
      </div>

      {status && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
            isApproved
              ? "border-primary/30 bg-primary/10"
              : status === VERIFICATION_STATUS.REJECTED
              ? "border-destructive/30 bg-destructive/10"
              : "border-accent/40 bg-accent/10"
          }`}
        >
          {isApproved ? (
            <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
          ) : status === VERIFICATION_STATUS.REJECTED ? (
            <XCircle className="h-5 w-5 shrink-0 text-destructive" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-accent" />
          )}
          <span>
            আপনার ভেরিফিকেশনের অবস্থা:{" "}
            <span className="font-semibold">{VERIFICATION_STATUS_LABEL_BN[status]}</span>
            {status === VERIFICATION_STATUS.REJECTED && " — তথ্য সংশোধন করে আবার জমা দিন।"}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ব্যক্তিগত তথ্য</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">প্রোফাইল ছবি</Label>
              <ImageUploader
                bucket="seller-verification"
                folder={user.id}
                value={form.profile_photo_url}
                onUploaded={(url) => update("profile_photo_url", url)}
                maxSizeKB={PROFILE_PHOTO_MAX_KB}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="full_name">পুরো নাম *</Label>
              <Input id="full_name" required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v_phone">ফোন নম্বর *</Label>
              <Input id="v_phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v_address">ঠিকানা / অবস্থান *</Label>
              <Input id="v_address" required value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v_map">Google Maps লোকেশন</Label>
              <Input
                id="v_map"
                value={form.google_map_link}
                onChange={(e) => update("google_map_link", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v_fb">ফেসবুক প্রোফাইল লিংক</Label>
              <Input
                id="v_fb"
                value={form.facebook_link}
                onChange={(e) => update("facebook_link", e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">জাতীয় পরিচয়পত্র (NID)</CardTitle>
            <CardDescription>NID-এর তথ্য শুধুমাত্র Super Admin যাচাই করার জন্য ব্যবহার করবেন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nid_number">NID নম্বর *</Label>
              <Input id="nid_number" required value={form.nid_number} onChange={(e) => update("nid_number", e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <Label className="mb-2 block">NID সামনের পাশের ছবি *</Label>
                <ImageUploader
                  bucket="seller-verification"
                  folder={user.id}
                  value={form.nid_front_url}
                  onUploaded={(url) => update("nid_front_url", url)}
                  aspect="wide"
                  maxSizeKB={NID_IMAGE_MAX_KB}
                />
              </div>
              <div>
                <Label className="mb-2 block">NID পেছনের পাশের ছবি *</Label>
                <ImageUploader
                  bucket="seller-verification"
                  folder={user.id}
                  value={form.nid_back_url}
                  onUploaded={(url) => update("nid_back_url", url)}
                  aspect="wide"
                  maxSizeKB={NID_IMAGE_MAX_KB}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving} size="lg">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "সংরক্ষণ হচ্ছে..." : saved ? "সংরক্ষিত হয়েছে" : status ? "তথ্য আপডেট করুন" : "ভেরিফিকেশনের জন্য জমা দিন"}
        </Button>
      </form>
    </div>
  );
}
