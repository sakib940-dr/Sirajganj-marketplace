import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import LoadingSpinner from "@/components/shared/LoadingSpinner.jsx";

/**
 * @param {"seller" | "super_admin"} requiredRole - এই role না থাকলে Home-এ পাঠিয়ে দেয়
 * @param {boolean} allowPendingSeller - true হলে seller_status !== approved থাকা সত্ত্বেও render হবে
 *   (Dashboard-এর ভেতরে "Pending Approval" বার্তা দেখানোর জন্য দরকার হয়)
 */
export default function ProtectedRoute({ children, requiredRole, allowPendingSeller = false }) {
  const { isLoggedIn, role, sellerStatus, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen label="লোড হচ্ছে..." />;
  }

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole === ROLES.SUPER_ADMIN && role !== ROLES.SUPER_ADMIN) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (requiredRole === ROLES.SELLER) {
    const isSellerOrAdmin = role === ROLES.SELLER || role === ROLES.SUPER_ADMIN;
    if (!isSellerOrAdmin) {
      return <Navigate to={ROUTES.HOME} replace />;
    }
    if (role === ROLES.SELLER && sellerStatus !== "approved" && !allowPendingSeller) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return children;
}
