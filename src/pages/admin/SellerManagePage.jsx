import { useEffect, useState, useCallback } from "react";
import { Check, X, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import { SELLER_STATUS, SELLER_STATUS_LABEL_BN } from "@/constants/roles";

export default function SellerManagePage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "seller")
      .order("created_at", { ascending: false });
    setProfiles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    // এই আপডেট শুধুমাত্র Super Admin RLS Policy দ্বারা অনুমোদিত
    const { error } = await supabase.from("profiles").update({ seller_status: status }).eq("id", id);
    if (!error) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, seller_status: status } : p)));
    }
    setBusyId(null);
  };

  if (loading) return <LoadingSpinner label="সেলার তালিকা লোড হচ্ছে..." />;

  if (profiles.length === 0) {
    return <EmptyState icon={Users} title="এখনো কোনো সেলার আবেদন নেই" />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
        সেলার ম্যানেজমেন্ট
      </h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">নাম</th>
              <th className="p-3 font-medium">অবস্থা</th>
              <th className="p-3 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-3">{p.full_name || "নাম নেই"}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.seller_status === SELLER_STATUS.APPROVED
                        ? "bg-primary/10 text-primary"
                        : p.seller_status === SELLER_STATUS.REJECTED
                        ? "bg-destructive/10 text-destructive"
                        : "bg-accent/15 text-accent"
                    }`}
                  >
                    {SELLER_STATUS_LABEL_BN[p.seller_status]}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={busyId === p.id || p.seller_status === SELLER_STATUS.APPROVED}
                      onClick={() => updateStatus(p.id, SELLER_STATUS.APPROVED)}
                    >
                      <Check className="h-4 w-4" /> অনুমোদন
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === p.id || p.seller_status === SELLER_STATUS.REJECTED}
                      onClick={() => updateStatus(p.id, SELLER_STATUS.REJECTED)}
                    >
                      <X className="h-4 w-4" /> প্রত্যাখ্যান
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
