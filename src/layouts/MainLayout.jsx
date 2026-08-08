import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header.jsx";
import Footer from "@/components/layout/Footer.jsx";
import VisitorBottomNav from "@/components/layout/VisitorBottomNav.jsx";
import { MobileMenuProvider } from "@/context/MobileMenuContext.jsx";

export default function MainLayout() {
  return (
    <MobileMenuProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        {/* মোবাইলে নিচের Bottom Navigation যাতে পেজের কনটেন্ট/ফুটার ঢেকে না ফেলে,
            তাই এখানে bottom padding — ডেস্কটপে (md+) bottom nav লুকানো থাকে বলে
            padding-ও লাগে না */}
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
        <Footer />
        <VisitorBottomNav />
      </div>
    </MobileMenuProvider>
  );
}
