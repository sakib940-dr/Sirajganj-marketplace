import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { ROUTES } from "@/constants/routes";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wantsSeller, setWantsSeller] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { data, error: signUpError } = await signUp(email, password, fullName);
    if (signUpError) {
      setError(signUpError.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে।");
      setSubmitting(false);
      return;
    }

    // যদি ভিজিটর সেলার হতে চায়, নিরাপদ RPC কল করে request পাঠানো হয়
    // (role/seller_status সরাসরি টেবিল থেকে আপডেট করা যায় না — RLS দ্বারা সুরক্ষিত)
    if (wantsSeller && data?.user) {
      await supabase.rpc("request_seller_status");
    }

    setSubmitting(false);
    navigate(ROUTES.DASHBOARD);
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
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
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
              আমি আমার দোকান খুলতে চাই (সেলার হওয়ার আবেদন করুন — সুপার অ্যাডমিন অনুমোদন করবেন)
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
