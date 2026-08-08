import { KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ChangePasswordForm from "@/components/shared/ChangePasswordForm.jsx";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABEL_BN } from "@/constants/roles";

export default function AccountPage() {
  const { profile, role } = useAuth();

  return (
    <div className="container max-w-lg py-10">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          অ্যাকাউন্ট
        </h1>
        <p className="text-sm text-muted-foreground">
          {profile?.full_name || profile?.email} — {ROLE_LABEL_BN[role]}
        </p>
      </div>

      <Card>
        <CardHeader>
          <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </span>
          <CardTitle>পাসওয়ার্ড পরিবর্তন করুন</CardTitle>
          <CardDescription>
            আপনার নিজের অ্যাকাউন্টের লগইন পাসওয়ার্ড এখান থেকে নিরাপদে পরিবর্তন করতে পারবেন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
