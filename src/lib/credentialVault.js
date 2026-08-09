import { supabase } from "@/lib/supabaseClient";

/**
 * ইউজার নিজে সাইনআপ করার সময় বা নিজের পাসওয়ার্ড পরিবর্তন/রিসেট করার সময়
 * এই ফাংশন দিয়ে সেই পাসওয়ার্ড admin_saved_credentials ভল্টে সংরক্ষণ করা
 * হয় (Edge Function-এর মাধ্যমে, service_role দিয়ে লেখা হয় বলে এটা
 * নির্ভরযোগ্য — ক্লায়েন্ট-সাইড RLS insert-এর মতো silently ব্যর্থ হয় না)
 * — শুধুমাত্র Super Admin পরে সেটা পড়তে পারবেন (দেখুন
 * 0023_admin_credential_vault.sql)।
 *
 * এই ফাংশন কখনো throw করে না এবং মূল auth flow-কে কখনো আটকায় না, তবে
 * ব্যর্থ হলে console.warn করে যাতে ডিবাগ করা যায় (আগে সম্পূর্ণ silent ছিল,
 * যার কারণে কখনো পাসওয়ার্ড সেভ না হওয়ার আসল কারণ বোঝা যাচ্ছিল না)।
 */
export async function saveCredentialToVault(password) {
  if (!password) return { success: false };
  try {
    const { data, error } = await supabase.functions.invoke("save-own-credential", {
      body: { password },
    });
    if (error || data?.error) {
      // eslint-disable-next-line no-console
      console.warn("পাসওয়ার্ড ভল্টে সংরক্ষণ ব্যর্থ হয়েছে:", data?.error || error?.message);
      return { success: false, error: data?.error || error?.message };
    }
    return { success: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("পাসওয়ার্ড ভল্টে সংরক্ষণ ব্যর্থ হয়েছে:", err);
    return { success: false, error: String(err) };
  }
}
