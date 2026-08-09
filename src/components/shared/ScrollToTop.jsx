import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router ক্লায়েন্ট-সাইড নেভিগেশনে ব্রাউজার স্বয়ংক্রিয়ভাবে স্ক্রল টপে
 * নিয়ে যায় না (আগের পেজের স্ক্রল পজিশনই থেকে যায়) — এই কারণে কোনো প্রোডাক্টে
 * ক্লিক করলে প্রোডাক্ট পেজের মাঝখান/নিচ থেকে শুরু হতো, বড় ছবিটা আগে
 * (প্রথমেই) দেখা যেত না। এই কম্পোনেন্ট প্রতিটা রুট পরিবর্তনে window-কে
 * টপে স্ক্রল করে দেয় — পুরো সাইটের জন্য একবারই যোগ করা হয়েছে (App.jsx-এ),
 * তাই ভবিষ্যতে নতুন কোনো পেজেও এই সমস্যা হবে না।
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
