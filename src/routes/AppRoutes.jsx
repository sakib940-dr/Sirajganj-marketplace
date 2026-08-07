import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout.jsx";
import DashboardLayout from "@/layouts/DashboardLayout.jsx";
import AdminLayout from "@/layouts/AdminLayout.jsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.jsx";
import { ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";

// Public
import HomePage from "@/pages/public/HomePage.jsx";
import CategoryPage from "@/pages/public/CategoryPage.jsx";
import ShopPage from "@/pages/public/ShopPage.jsx";
import ProductPage from "@/pages/public/ProductPage.jsx";
import SearchResultPage from "@/pages/public/SearchResultPage.jsx";
import LoginPage from "@/pages/public/LoginPage.jsx";
import RegisterPage from "@/pages/public/RegisterPage.jsx";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage.jsx";
import ResetPasswordPage from "@/pages/public/ResetPasswordPage.jsx";
import NotFoundPage from "@/pages/public/NotFoundPage.jsx";

// Seller
import DashboardHome from "@/pages/seller/DashboardHome.jsx";
import ShopSettingsPage from "@/pages/seller/ShopSettingsPage.jsx";
import ProductListPage from "@/pages/seller/ProductListPage.jsx";
import ProductEditPage from "@/pages/seller/ProductEditPage.jsx";
import GalleryPage from "@/pages/seller/GalleryPage.jsx";
import SellerVerificationPage from "@/pages/seller/SellerVerificationPage.jsx";

// Admin
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import UserManagePage from "@/pages/admin/UserManagePage.jsx";
import SellerManagePage from "@/pages/admin/SellerManagePage.jsx";
import SellerVerificationManagePage from "@/pages/admin/SellerVerificationManagePage.jsx";
import CategoryManagePage from "@/pages/admin/CategoryManagePage.jsx";
import ProductManagePage from "@/pages/admin/ProductManagePage.jsx";
import BannerManagePage from "@/pages/admin/BannerManagePage.jsx";
import SiteSettingsPage from "@/pages/admin/SiteSettingsPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.CATEGORY} element={<CategoryPage />} />
        <Route path={ROUTES.SHOP} element={<ShopPage />} />
        <Route path={ROUTES.PRODUCT} element={<ProductPage />} />
        <Route path={ROUTES.SEARCH} element={<SearchResultPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      {/* Seller (protected, role: seller — pending seller-রাও ঢুকতে পারবে যাতে Pending নোটিশ দেখতে পায়) */}
      <Route
        element={
          <ProtectedRoute requiredRole={ROLES.SELLER} allowPendingSeller>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardHome />} />
        <Route path={ROUTES.DASHBOARD_SHOP} element={<ShopSettingsPage />} />
        <Route path={ROUTES.DASHBOARD_PRODUCTS} element={<ProductListPage />} />
        <Route path={ROUTES.DASHBOARD_PRODUCT_NEW} element={<ProductEditPage />} />
        <Route path={ROUTES.DASHBOARD_PRODUCT_EDIT} element={<ProductEditPage />} />
        <Route path={ROUTES.DASHBOARD_GALLERY} element={<GalleryPage />} />
        <Route path={ROUTES.DASHBOARD_VERIFICATION} element={<SellerVerificationPage />} />
      </Route>

      {/* Admin (protected, role: super_admin) */}
      <Route
        element={
          <ProtectedRoute requiredRole={ROLES.SUPER_ADMIN}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_USERS} element={<UserManagePage />} />
        <Route path={ROUTES.ADMIN_SELLERS} element={<SellerManagePage />} />
        <Route path={ROUTES.ADMIN_VERIFICATIONS} element={<SellerVerificationManagePage />} />
        <Route path={ROUTES.ADMIN_CATEGORIES} element={<CategoryManagePage />} />
        <Route path={ROUTES.ADMIN_PRODUCTS} element={<ProductManagePage />} />
        <Route path={ROUTES.ADMIN_BANNERS} element={<BannerManagePage />} />
        <Route path={ROUTES.ADMIN_SETTINGS} element={<SiteSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
