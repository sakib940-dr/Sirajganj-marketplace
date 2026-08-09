import { supabase } from "@/lib/supabaseClient";

/**
 * ইউজার নিজে সাইনআপ করার সময় বা নিজের পাসওয়ার্ড পরিবর্তন করার সময়
 * এই ফাংশন দিয়ে সেই পাসওয়ার্ড admin_saved_credentials ভল্টে সংরক্ষণ
 * করা হয় — শুধুমাত্র Super Admin পরে সেটা পড়তে পারবেন (RLS দ্বারা
 * সুরক্ষিত, দেখুন 0023_admin_credential_vault.sql)। এই ফাংশন কখনো
 * throw করে না — এটি ব্যর্থ হলেও সাইনআপ/পাসওয়ার্ড-পরিবর্তন ফ্লো যেন
 * আটকে না যায়, তাই এখানেই silently error ধরে নেওয়া হয়।
 */
export async function saveCredentialToVault(userId, password) {
  if (!userId || !password) return;
  try {
    await supabase
      .from("admin_saved_credentials")
      .upsert({ user_id: userId, password, updated_by: userId }, { onConflict: "user_id" });
  } catch {
    // ইচ্ছাকৃতভাবে silently ignore — এটি একটি সহায়ক/ঐচ্ছিক ফিচার,
    // মূল auth flow-কে কখনো ব্যর্থ করবে না।
  }
}
