import { useEffect, useState, useCallback } from "react";
import { ShieldPlus, ShieldMinus, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";
import EmptyState from "@/components/shared/EmptyState.jsx";
import { formatDateBn } from "@/lib/utils";

const ROLE_LABEL_BN = {
  visitor: "ভিজিটর",
  seller: "সেলার",
  super_admin: "সুপার অ্যাডমিন",
};

export default function UserManagePage() {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleAdmin = async (profile) => {
    setBusyId(profile.id);
    const newRole = profile.role === "super_admin" ? "visitor" : "super_admin";
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", profile.id);
    if (!error) {
      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? { ...p, role: newRole } : p)));
    }
    setBusyId(null);
  };

  if (loading) return <LoadingSpinner label="ইউজার তালিকা লোড হচ্ছে..." />;

  if (profiles.length === 0) {
    return <EmptyState icon={Users} title="কোনো ইউজার পাওয়া যায়নি" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          ব্যবহারকারী ম্যানেজমেন্ট
        </h1>
        <p className="text-sm text-muted-foreground">
          সব রেজিস্টার্ড ইউজারের তথ্য — নিরাপত্তার জন্য পাসওয়ার্ড কখনো এখানে দেখানো হয় না
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">নাম</th>
              <th className="p-3 font-medium">ইমেইল</th>
              <th className="p-3 font-medium">ফোন</th>
              <th className="p-3 font-medium">রোল</th>
              <th className="p-3 font-medium">যোগদান</th>
              <th className="p-3 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-3">{p.full_name || "—"}</td>
                <td className="p-3 text-muted-foreground">{p.email || "—"}</td>
                <td className="p-3 text-muted-foreground">{p.phone || "—"}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.role === "super_admin"
                        ? "bg-primary/10 text-primary"
                        : p.role === "seller"
                        ? "bg-accent/15 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ROLE_LABEL_BN[p.role] || p.role}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{formatDateBn(p.created_at)}</td>
                <td className="p-3">
                  {p.id === currentUser.id ? (
                    <span className="text-xs text-muted-foreground">(আপনি)</span>
                  ) : p.role === "super_admin" ? (
                    <Button size="sm" variant="outline" disabled={busyId === p.id} onClick={() => toggleAdmin(p)}>
                      <ShieldMinus className="h-4 w-4" /> অ্যাডমিন সরান
                    </Button>
                  ) : (
                    <Button size="sm" variant="default" disabled={busyId === p.id} onClick={() => toggleAdmin(p)}>
                      <ShieldPlus className="h-4 w-4" /> অ্যাডমিন বানান
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
