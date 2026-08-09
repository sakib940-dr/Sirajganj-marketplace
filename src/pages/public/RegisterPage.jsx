import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { saveCredentialToVault } from "@/lib/credentialVault";
import { ROUTES } from "@/constants/routes";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [wantsSeller, setWantsSeller] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { data, error: signUpError } = await signUp(email, password, fullName, phone);
    if (signUpError) {
      setError(signUpError.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
      setSubmitting(false);
      return;
    }

    // Super Admin Panel-এ (ইউজার রোলসহ পেজে) পরে দেখার জন্য এই পাসওয়ার্ড
    // ভল্টে সংরক্ষণ করা হচ্ছে — SMS/paid reset provider এখনো যোগ করা হয়নি
    // বলে এটি সাময়িক ব্যবস্থা (owner-এর সুস্পষ্ট অনুরোধে)।
    if (data?.user) {
      await saveCredentialToVault(password);
    }

    // যদি ভিজিটর সেলার হতে চায়, নিরাপদ RPC কল করে request পাঠানো হয়
    // (role/seller_status সরাসরি টেবিল থেকে আপডেট করা যায় না — RLS দ্বারা সুরক্ষিত)
    let rpcFailed = false;
    if (wantsSeller && data?.user) {
      const { error: rpcError } = await supabase.rpc("request_seller_status");
      if (rpcError) {
        // CRITICAL FIX: আগে এই error চেক করা হতো না — RPC silently ব্যর্থ
        // হলেও ইউজার কিছু বুঝতে পারতো না এবং role কখনো 'seller' হতো না,
        // ফলে Dashboard এ ঢুকতে গেলে normal visitor হিসেবে Home এ redirect
        // হয়ে যেত।
        // eslint-disable-next-line no-console
        console.error("সেলার আবেদন ব্যর্থ হয়েছে:", rpcError.message);
        rpcFailed = true;
        setError(
          "অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু সেলার আবেদন পাঠাতে সমস্যা হয়েছে। কিছুক্ষণ পর লগইন করে আবার চেষ্টা করুন অথবা সাপোর্টে যোগাযোগ করুন।"
        );
      }
    }

    // CRITICAL FIX: RPC কল করার পর ডাটাবেসে role/seller_status বদলে গেলেও
    // AuthContext-এর local state (useAuth থেকে পাওয়া role) সাথে সাথে আপডেট
    // হয় না — কারণ onAuthStateChange listener আলাদা async flow-এ চলে।
    // navigate করার আগে explicit ভাবে profile refresh করে নেওয়া হচ্ছে,
    // যাতে ProtectedRoute সঠিক (নতুন) role দেখে সঠিক জায়গায় নিয়ে যায়।
    await refreshProfile(data?.user?.id);

    setSubmitting(false);

    // RPC ব্যর্থ হলে এই পেজেই থাকুক, যাতে error message দেখতে পায়
    if (!rpcFailed) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </span>
          <CardTitle style={{ fontFamily: "'Tiro Bangla', serif" }}>নতুন অ্যাকাউন্ট</CardTitle>
          <CardDescription>ভিজিটর হিসেবে শুরু করুন, চাইলে সেলার হওয়ার আবেদনও করতে পারবেন</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">পুরো নাম</Label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="আপনার নাম"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">মোবাইল নম্বর</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <PasswordInput
                id="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ ডিজিট"
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={wantsSeller}
                onChange={(e) => setWantsSeller(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              />
              আমি আমার দোকান খুলতে চাই (সেলার হওয়ার আবেদন করুন — অ্যাডমিন অনুমোদন করবেন)
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
              লগইন করুন
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
