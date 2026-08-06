import { useEffect, useState } from "react";
import { Save, Check, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";

const FIELDS = [
  { key: "site_name", label: "সাইটের নাম" },
  { key: "contact_phone", label: "যোগাযোগ ফোন নম্বর" },
  { key: "contact_email", label: "যোগাযোগ ইমেইল" },
  { key: "footer_address", label: "ঠিকানা (ফুটারে দেখাবে)" },
];

export default function SiteSettingsPage() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .then(({ data }) => {
        const map = {};
        (data ?? []).forEach((row) => (map[row.key] = row.value));
        setValues(map);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const rows = FIELDS.map((f) => ({ key: f.key, value: values[f.key] || "" }));
    await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <LoadingSpinner label="লোড হচ্ছে..." />;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          <Settings className="h-5 w-5 text-primary" /> ওয়েবসাইট সেটিংস
        </h1>
        <p className="text-sm text-muted-foreground">সাইটের সাধারণ তথ্য এখান থেকে নিয়ন্ত্রণ করুন</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              value={values[f.key] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <Button type="submit" disabled={saving}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "সংরক্ষণ হচ্ছে..." : saved ? "সংরক্ষিত হয়েছে" : "সংরক্ষণ করুন"}
        </Button>
      </form>
    </div>
  );
}
