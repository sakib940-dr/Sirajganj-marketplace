import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-primary text-primary-foreground">
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Store className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>
              বাজার
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-primary-foreground/70">
            আপনার এলাকার সব দোকান, সব পণ্য — এক জায়গায়। স্থানীয় ব্যবসাকে ডিজিটাল পরিচিতি দিতে বাজার।
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-accent">দ্রুত লিংক</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to={ROUTES.HOME}>হোমপেজ</Link></li>
            <li><Link to={ROUTES.SEARCH}>পণ্য খুঁজুন</Link></li>
            <li><Link to={ROUTES.REGISTER}>সেলার হিসেবে যোগ দিন</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-accent">যোগাযোগ</h4>
          <p className="text-sm text-primary-foreground/80">সিরাজগঞ্জ, রাজশাহী বিভাগ, বাংলাদেশ</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} বাজার। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
