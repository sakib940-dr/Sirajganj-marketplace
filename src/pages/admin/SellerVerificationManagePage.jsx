import { useEffect, useState, useCallback } from "react";
import { Check, X, ShieldCheck, MapPin, Facebook, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState.jsx";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import { VERIFICATION_STATUS, VERIFICATION_STATUS_LABEL_BN } from "@/constants/roles";

export default function SellerVerificationManagePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("seller_verifications")
      .select("*, profiles:user_id ( full_name, email, phone )")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    const { error } = await supabase.from("seller_verifications").update({ status }).eq("id", id);
    if (!error) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
    }
    setBusyId(null);
  };

  if (loading) return <LoadingSpinner label="ভেরিফিকেশন তালিকা লোড হচ্ছে..." />;

  if (items.length === 0) {
    return <EmptyState icon={ShieldCheck} title="এখনো কোনো সেলার ভেরিফিকেশন আবেদন নেই" />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
        সেলার ভেরিফিকেশন
      </h1>

      <div className="space-y-4">
        {items.map((v) => (
          <div key={v.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-secondary">
                  {v.profile_photo_url && (
                    <img src={v.profile_photo_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{v.full_name || v.profiles?.full_name || "নাম নেই"}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.profiles?.email} {v.phone ? `· ${v.phone}` : ""}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  v.status === VERIFICATION_STATUS.APPROVED
                    ? "bg-primary/10 text-primary"
                    : v.status === VERIFICATION_STATUS.REJECTED
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent/15 text-accent"
                }`}
              >
                {VERIFICATION_STATUS_LABEL_BN[v.status]}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 text-sm">
                <p>
                  <span className="text-muted-foreground">ঠিকানা: </span>
                  {v.address || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">NID নম্বর: </span>
                  {v.nid_number || "—"}
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  {v.google_map_link && (
                    <a
                      href={v.google_map_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <MapPin className="h-3.5 w-3.5" /> ম্যাপ দেখুন
                    </a>
                  )}
                  {v.facebook_link && (
                    <a
                      href={v.facebook_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Facebook className="h-3.5 w-3.5" /> ফেসবুক প্রোফাইল
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {v.nid_front_url && (
                  <a href={v.nid_front_url} target="_blank" rel="noreferrer" className="group relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border">
                    <img src={v.nid_front_url} alt="NID সামনে" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
                      <ExternalLink className="h-4 w-4 text-white" />
                    </span>
                  </a>
                )}
                {v.nid_back_url && (
                  <a href={v.nid_back_url} target="_blank" rel="noreferrer" className="group relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border">
                    <img src={v.nid_back_url} alt="NID পেছনে" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
                      <ExternalLink className="h-4 w-4 text-white" />
                    </span>
                  </a>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                disabled={busyId === v.id || v.status === VERIFICATION_STATUS.APPROVED}
                onClick={() => updateStatus(v.id, VERIFICATION_STATUS.APPROVED)}
              >
                <Check className="h-4 w-4" /> অনুমোদন
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === v.id || v.status === VERIFICATION_STATUS.REJECTED}
                onClick={() => updateStatus(v.id, VERIFICATION_STATUS.REJECTED)}
              >
                <X className="h-4 w-4" /> প্রত্যাখ্যান
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
