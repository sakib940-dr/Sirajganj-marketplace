// supabase/functions/save-own-credential/index.ts
//
// সাইনআপ/পাসওয়ার্ড পরিবর্তন/রিসেট করার পরপরই ফ্রন্টএন্ড থেকে এই ফাংশন
// কল করা হয়, যাতে সেই প্লেইন-টেক্সট পাসওয়ার্ড admin_saved_credentials
// ভল্টে নির্ভরযোগ্যভাবে সংরক্ষিত হয় (শুধু Super Admin পরে দেখতে পারবেন)।
//
// আগে এটা ক্লায়েন্ট থেকে সরাসরি supabase.from(...).upsert() দিয়ে করার
// চেষ্টা হতো, কিন্তু RLS auth.uid() নির্ভরতার কারণে কিছু ক্ষেত্রে
// silently ব্যর্থ হচ্ছিল এবং error কোথাও দেখানো হচ্ছিল না — ফলে UI-তে
// সবসময় "সংরক্ষিত নেই" দেখাতো। এই ফাংশন service_role দিয়ে সরাসরি লেখে
// (RLS bypass করে), তাই এটা সবসময় নির্ভরযোগ্যভাবে কাজ করবে — কিন্তু
// প্রথমে caller-এর নিজের JWT verify করে, তাই কেউ অন্য কারো জন্য পাসওয়ার্ড
// সেভ করতে পারবে না, শুধু নিজের জন্যই পারবে।
//
// Deploy: supabase functions deploy save-own-credential

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: "কমপক্ষে ৬ ডিজিটের password প্রয়োজন।" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // caller-এর JWT দিয়ে identity যাচাই — শুধু নিজের জন্যই লিখতে পারবে
    const authHeader = req.headers.get("Authorization");
    const callerClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader ?? "" } } }
    );

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();

    if (!caller) {
      return new Response(JSON.stringify({ error: "লগইন প্রয়োজন।" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // service_role দিয়ে সরাসরি ভল্টে লেখা হচ্ছে (RLS bypass, কিন্তু user_id
    // সবসময় caller.id — কখনো ক্লায়েন্ট-প্রদত্ত userId ব্যবহার করা হয় না)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: upsertError } = await adminClient
      .from("admin_saved_credentials")
      .upsert({ user_id: caller.id, password, updated_by: caller.id }, { onConflict: "user_id" });

    if (upsertError) {
      return new Response(JSON.stringify({ error: upsertError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
