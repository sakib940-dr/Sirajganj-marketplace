import AppRoutes from "@/routes/AppRoutes.jsx";
import InstallPromptBanner from "@/components/shared/InstallPromptBanner.jsx";

export default function App() {
  return (
    <>
      <AppRoutes />
      <InstallPromptBanner />
    </>
  );
}
