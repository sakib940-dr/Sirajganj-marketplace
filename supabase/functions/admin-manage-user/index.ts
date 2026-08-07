// supabase/functions/admin-manage-user/index.ts
//
// এই Edge Function শুধুমাত্র verified Super Admin-কে অন্য যেকোনো ইউজারকে
// ban / unban / delete করার অনুমতি দেয়। service_role key কখনো browser-এ
// পাঠানো হয় না — এটা শুধু এই সার্ভার-সাইড ফাংশনের ভেতরেই ব্যবহৃত হয়।
// (এটি admin-reset-password ফাংশনের মতোই একই security প্যাটার্ন অনুসরণ করে।)
//
// action: "ban" | "unban" | "delete"
//
// Deploy: supabase functions deploy admin-manage-user

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BAN_DURATION = "876000h"; // ~100 বছর, কার্যত স্থায়ী ব্যান

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, action } = await req.json();

    if (!userId || !["ban", "unban", "delete"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "userId এবং সঠিক action (ban/unban/delete) প্রয়োজন।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ১. caller-এর JWT দিয়ে ক্লায়েন্ট বানানো — identity যাচাইয়ের জন্য
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

    // ২. caller সত্যিই super_admin কিনা যাচাই
    const { data: callerProfile } = await callerClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (callerProfile?.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "শুধুমাত্র Super Admin এই কাজ করতে পারবেন।" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (userId === caller.id) {
      return new Response(JSON.stringify({ error: "নিজের অ্যাকাউন্টে এই অ্যাকশন প্রয়োগ করা যাবে না।" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ৩. service_role client দিয়ে আসল কাজ
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (action === "delete") {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) {
        return new Response(JSON.stringify({ error: deleteError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // profiles row auth.users FK-তে on delete cascade থাকায় স্বয়ংক্রিয়ভাবে মুছে যায়
    } else {
      // ban / unban — Supabase Auth লেভেলে লগইন বন্ধ/চালু করা হচ্ছে
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: action === "ban" ? BAN_DURATION : "none",
      });
      if (authError) {
        return new Response(JSON.stringify({ error: authError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // profiles.account_status ও আপডেট — এটি অ্যাপের ভেতরের UI/route গার্ডের জন্য ব্যবহৃত হয়
      const { error: profileError } = await adminClient
        .from("profiles")
        .update({ account_status: action === "ban" ? "banned" : "active" })
        .eq("id", userId);
      if (profileError) {
        return new Response(JSON.stringify({ error: profileError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
