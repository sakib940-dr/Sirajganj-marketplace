import AppRoutes from "@/routes/AppRoutes.jsx";
import InstallPromptBanner from "@/components/shared/InstallPromptBanner.jsx";
import SiteFavicon from "@/components/shared/SiteFavicon.jsx";
import ScrollToTop from "@/components/shared/ScrollToTop.jsx";

export default function App() {
  return (
    <>
      <SiteFavicon />
      <ScrollToTop />
      <AppRoutes />
      <InstallPromptBanner />
    </>
  );
}
