import { useEffect, useState } from "react";
import { Save, Check, Clock, XCircle, BadgeCheck, RefreshCcw, Lock } from "lucide-react";
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
  business_type: "",
  product_type: "",
  avg_monthly_sales_bdt: "",
  sales_channel: "",
  sells_via_facebook_page: "",
  uses_other_ecommerce_platform: "",
  other_ecommerce_platform_name: "",
  monthly_sales_target_bdt: "",
};

const PROFILE_PHOTO_MAX_KB = 2048; // ২ MB
const NID_IMAGE_MAX_KB = 500;

const selectClass =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function SellerVerificationPage() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(EMPTY_VERIFICATION);
  const [applicationId, setApplicationId] = useState(null);
  const [status, setStatus] = useState(null); // null মানে এখনো আবেদন করা হয়নি
  const [adminNote, setAdminNote] = useState("");
  const [previousCount, setPreviousCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [startingNew, setStartingNew] = useState(false);

  const loadLatest = () => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("seller_verifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = data ?? [];
        const latest = rows[0];
        if (latest) {
          setForm({ ...EMPTY_VERIFICATION, ...latest });
          setApplicationId(latest.id);
          setStatus(latest.status);
          setAdminNote(latest.admin_note || "");
        } else {
          setForm((f) => ({ ...f, full_name: profile?.full_name || "", phone: profile?.phone || "" }));
          setApplicationId(null);
          setStatus(null);
          setAdminNote("");
        }
        setPreviousCount(Math.max(rows.length - 1, 0));
        setStartingNew(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const startNewApplication = () => {
    setForm({
      ...EMPTY_VERIFICATION,
      full_name: form.full_name,
      phone: form.phone,
      address: form.address,
      google_map_link: form.google_map_link,
      facebook_link: form.facebook_link,
    });
    setApplicationId(null);
    setStartingNew(true);
    setError("");
  };

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
      !form.nid_back_url ||
      !form.business_type.trim() ||
      !form.product_type.trim() ||
      form.avg_monthly_sales_bdt === "" ||
      !form.sales_channel.trim() ||
      form.sells_via_facebook_page === "" ||
      form.uses_other_ecommerce_platform === "" ||
      form.monthly_sales_target_bdt === ""
    ) {
      setError("চিহ্নিত (*) সব তথ্য এবং NID-এর দুই পাশের ছবি অবশ্যই দিতে হবে।");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        user_id: user.id,
        avg_monthly_sales_bdt: form.avg_monthly_sales_bdt === "" ? null : Number(form.avg_monthly_sales_bdt),
        monthly_sales_target_bdt: form.monthly_sales_target_bdt === "" ? null : Number(form.monthly_sales_target_bdt),
        sells_via_facebook_page: form.sells_via_facebook_page === "" ? null : form.sells_via_facebook_page === "yes",
        uses_other_ecommerce_platform:
          form.uses_other_ecommerce_platform === "" ? null : form.uses_other_ecommerce_platform === "yes",
      };
      delete payload.id;
      delete payload.status;
      delete payload.admin_note;
      delete payload.created_at;
      delete payload.updated_at;

      // pending অবস্থায় থাকা নিজের আবেদন আপডেট হয় (id দিয়ে), অন্যথায় একটি
      // সম্পূর্ণ নতুন আবেদন (row) insert হয় — পুরনো আবেদন কখনো ওভাররাইট হয় না।
      const query = applicationId
        ? supabase.from("seller_verifications").update(payload).eq("id", applicationId)
        : supabase.from("seller_verifications").insert(payload);

      const { data, error: saveError } = await query.select().single();

      if (saveError) {
        setError("সংরক্ষণ ব্যর্থ হয়েছে: " + saveError.message);
        return;
      }

      setForm({ ...EMPTY_VERIFICATION, ...data });
      setApplicationId(data.id);
      setStatus(data.status);
      setAdminNote(data.admin_note || "");
      setStartingNew(false);
      if (!applicationId) setPreviousCount((c) => c + (status ? 1 : 0));
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
  const isRejected = status === VERIFICATION_STATUS.REJECTED;
  const isLocked = (isApproved || isRejected) && !startingNew;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          সেলার ভেরিফিকেশন
        </h1>
        <p className="text-sm text-muted-foreground">
          ক্রেতাদের আস্থা বাড়াতে আপনার পরিচয় ও ব্যবসা যাচাই করুন। Admin Panel থেকে আপনার তথ্য পর্যালোচনা করা হবে।
        </p>
      </div>

      {status && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
            isApproved
              ? "border-primary/30 bg-primary/10"
              : isRejected
              ? "border-destructive/30 bg-destructive/10"
              : "border-accent/40 bg-accent/10"
          }`}
        >
          {isApproved ? (
            <BadgeCheck className="h-5 w-5 shrink-0 text-primary" />
          ) : isRejected ? (
            <XCircle className="h-5 w-5 shrink-0 text-destructive" />
          ) : (
            <Clock className="h-5 w-5 shrink-0 text-accent" />
          )}
          <span>
            আপনার সাম্প্রতিক আবেদনের অবস্থা:{" "}
            <span className="font-semibold">{VERIFICATION_STATUS_LABEL_BN[status]}</span>
            {isRejected && adminNote && <> — {adminNote}</>}
          </span>
        </div>
      )}

      {previousCount > 0 && (
        <p className="text-xs text-muted-foreground">
          এটি ছাড়াও আপনার {previousCount}টি পূর্ববর্তী আবেদন সংরক্ষিত আছে। পূর্ববর্তী আবেদনের তথ্য/ছবি মুছে ফেলা যায় না।
        </p>
      )}

      {isApproved && !startingNew && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
          আপনি ইতিমধ্যে ভেরিফাইড। নিচে আপনার অনুমোদিত আবেদনের তথ্য (শুধু দেখার জন্য) দেখানো হচ্ছে।
        </div>
      )}

      {isRejected && !startingNew && (
        <Button type="button" variant="outline" onClick={startNewApplication}>
          <RefreshCcw className="h-4 w-4" />
          নতুন আবেদন জমা দিন
        </Button>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset disabled={isLocked} className="space-y-5">
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
              <CardTitle className="text-base">ব্যবসা সম্পর্কিত তথ্য</CardTitle>
              <CardDescription>আপনার ব্যবসা যাচাই করতে নিচের প্রশ্নগুলোর উত্তর দিন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="business_type">আপনি কী ধরনের ব্যবসা করতে চান? *</Label>
                <Input
                  id="business_type"
                  required
                  value={form.business_type}
                  onChange={(e) => update("business_type", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product_type">আপনি কী ধরনের পণ্য বিক্রি করতে চান? *</Label>
                <Input
                  id="product_type"
                  required
                  value={form.product_type}
                  onChange={(e) => update("product_type", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avg_sales">বর্তমানে আপনার মাসিক গড় বিক্রয় কত টাকা? *</Label>
                <Input
                  id="avg_sales"
                  type="number"
                  min={0}
                  required
                  value={form.avg_monthly_sales_bdt}
                  onChange={(e) => update("avg_monthly_sales_bdt", e.target.value)}
                  placeholder="৳"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sales_channel">আপনি কীভাবে আপনার পণ্য বিক্রি করেন? *</Label>
                <Input
                  id="sales_channel"
                  required
                  value={form.sales_channel}
                  onChange={(e) => update("sales_channel", e.target.value)}
                  placeholder="যেমন: দোকান, ফেসবুক, হোম ডেলিভারি ইত্যাদি"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb_page">আপনি কি কোনো Facebook Page-এর মাধ্যমে পণ্য বিক্রি করেন? *</Label>
                <select
                  id="fb_page"
                  required
                  value={form.sells_via_facebook_page}
                  onChange={(e) => update("sells_via_facebook_page", e.target.value)}
                  className={selectClass}
                >
                  <option value="" disabled>
                    নির্বাচন করুন
                  </option>
                  <option value="yes">হ্যাঁ</option>
                  <option value="no">না</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="other_platform">আপনি কি অন্য কোনো e-commerce platform-এর সাথে যুক্ত? *</Label>
                <select
                  id="other_platform"
                  required
                  value={form.uses_other_ecommerce_platform}
                  onChange={(e) => update("uses_other_ecommerce_platform", e.target.value)}
                  className={selectClass}
                >
                  <option value="" disabled>
                    নির্বাচন করুন
                  </option>
                  <option value="yes">হ্যাঁ</option>
                  <option value="no">না</option>
                </select>
              </div>
              {form.uses_other_ecommerce_platform === "yes" && (
                <div className="space-y-1.5">
                  <Label htmlFor="other_platform_name">কোন platform?</Label>
                  <Input
                    id="other_platform_name"
                    value={form.other_ecommerce_platform_name}
                    onChange={(e) => update("other_ecommerce_platform_name", e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="sales_target">আপনার মাসিক বিক্রয়ের লক্ষ্য কত টাকা? *</Label>
                <Input
                  id="sales_target"
                  type="number"
                  min={0}
                  required
                  value={form.monthly_sales_target_bdt}
                  onChange={(e) => update("monthly_sales_target_bdt", e.target.value)}
                  placeholder="৳"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">জাতীয় পরিচয়পত্র (NID)</CardTitle>
              <CardDescription>NID-এর তথ্য শুধুমাত্র Admin Panel যাচাই করার জন্য ব্যবহার করবে</CardDescription>
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
        </fieldset>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {isLocked ? (
          isRejected && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> এই আবেদনটি প্রত্যাখ্যাত ও সংরক্ষিত — সংশোধনের জন্য উপরের "নতুন আবেদন জমা দিন" বাটনে ক্লিক করুন।
            </p>
          )
        ) : (
          <Button type="submit" disabled={saving} size="lg">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "সংরক্ষণ হচ্ছে..." : saved ? "সংরক্ষিত হয়েছে" : status && applicationId ? "তথ্য আপডেট করুন" : "ভেরিফিকেশনের জন্য জমা দিন"}
          </Button>
        )}
      </form>
    </div>
  );
}
