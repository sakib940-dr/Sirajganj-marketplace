import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PendingApprovalNotice from "@/components/seller/PendingApprovalNotice.jsx";
import { ROUTES } from "@/constants/routes";
import { ROLES, SELLER_STATUS, isAdminOrAbove } from "@/constants/roles";

export default function DashboardHome() {
  const { role, sellerStatus, profile } = useAuth();

  const isApprovedSeller =
    isAdminOrAbove(role) || (role === ROLES.SELLER && sellerStatus === SELLER_STATUS.APPROVED);

  if (!isApprovedSeller) {
    return <PendingApprovalNotice status={sellerStatus} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-6">
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
          স্বাগতম, {profile?.full_name || "সেলার"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">আপনার দোকান এখান থেকে পরিচালনা করুন</p>
      </div>

      <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
        আপনার দোকানের তথ্য পূরণ বা হালনাগাদ করতে চান?{" "}
        <Link to={ROUTES.DASHBOARD_SHOP} className="font-medium text-primary hover:underline">
          এখনই দেখুন
        </Link>
      </div>
    </div>
  );
}
