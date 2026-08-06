import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merge helper (shadcn/ui pattern) */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** বাংলা/ইংরেজি টেক্সট থেকে URL-friendly slug তৈরি করে */
export function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0980-\u09FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** সংখ্যাকে বাংলা মুদ্রা ফরম্যাটে দেখায়, যেমন ১,২৫০ টাকা */
export function formatPriceBn(amount) {
  if (amount === null || amount === undefined) return "";
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const formatted = Number(amount).toLocaleString("en-IN");
  const converted = formatted.replace(/\d/g, (d) => bnDigits[d]);
  return `৳ ${converted}`;
}

/** তারিখকে বাংলা লোকেলে ফরম্যাট করে */
export function formatDateBn(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
