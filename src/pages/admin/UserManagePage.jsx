import { useEffect, useState, useCallback } from "react";
import { ShieldPlus, ShieldMinus, Users, KeyRound, Copy, Check, X } from "lucide-react";
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

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function UserManagePage() {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [resetResult, setResetResult] = useState(null); // { name, password }
  const [resetError, setResetError] = useState("");
  const [copied, setCopied] = useState(false);

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

  const handleResetPassword = async (profile) => {
    if (
      !window.confirm(
        `"${profile.full_name || profile.email}" এর পাসওয়ার্ড রিসেট করতে চান? পুরনো পাসওয়ার্ড আর কাজ করবে না — নতুন একটি পাসওয়ার্ড তৈরি হবে যা আপনাকে সেলারকে জানাতে হবে।`
      )
    )
      return;

    setBusyId(profile.id);
    setResetError("");
    const newPassword = generatePassword();

    const { data, error } = await supabase.functions.invoke("admin-reset-password", {
      body: { userId: profile.id, newPassword },
    });

    setBusyId(null);

    if (error || data?.error) {
      setResetError(data?.error || error.message || "পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।");
      return;
    }

    // এই পাসওয়ার্ড কোথাও সংরক্ষণ করা হয় না — শুধু একবার এখানে দেখানো হচ্ছে,
    // যাতে আপনি এখনই কপি করে সেলারকে (নিরাপদ চ্যানেলে) পাঠিয়ে দিতে পারেন
    setResetResult({ name: profile.full_name || profile.email, password: newPassword });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(resetResult.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          সব রেজিস্টার্ড ইউজারের তথ্য — নিরাপত্তার জন্য পাসওয়ার্ড কখনো ডাটাবেসে সংরক্ষিত/দৃশ্যমান থাকে না
        </p>
      </div>

      {resetResult && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-accent bg-accent/10 p-4">
          <div>
            <p className="text-sm font-medium">
              {resetResult.name}-এর নতুন পাসওয়ার্ড তৈরি হয়েছে — এখনই কপি করে নিন, পরে আর দেখা যাবে না:
            </p>
            <p className="mt-1 rounded bg-card px-3 py-1.5 font-mono text-base font-semibold tracking-wide">
              {resetResult.password}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="outline" onClick={copyPassword}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "কপি হয়েছে" : "কপি করুন"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setResetResult(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {resetError && <p className="text-sm text-destructive">{resetError}</p>}

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
                  <div className="flex flex-wrap gap-1.5">
                    {p.id === currentUser.id ? (
                      <span className="text-xs text-muted-foreground">(আপনি)</span>
                    ) : (
                      <>
                        {p.role === "super_admin" ? (
                          <Button size="sm" variant="outline" disabled={busyId === p.id} onClick={() => toggleAdmin(p)}>
                            <ShieldMinus className="h-4 w-4" /> অ্যাডমিন সরান
                          </Button>
                        ) : (
                          <Button size="sm" variant="default" disabled={busyId === p.id} onClick={() => toggleAdmin(p)}>
                            <ShieldPlus className="h-4 w-4" /> অ্যাডমিন বানান
                          </Button>
                        )}
                        <Button size="sm" variant="outline" disabled={busyId === p.id} onClick={() => handleResetPassword(p)}>
                          <KeyRound className="h-4 w-4" /> পাসওয়ার্ড রিসেট
                        </Button>
                      </>
                    )}
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
