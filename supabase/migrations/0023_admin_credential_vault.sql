-- ============================================================
-- 0023: Super Admin Credential Vault
-- ============================================================
-- ⚠️ গুরুত্বপূর্ণ নিরাপত্তা নোট ⚠️
-- Supabase Auth ডিফল্টভাবে পাসওয়ার্ড hash করে রাখে — কেউই (Admin সহ) তা
-- প্লেইন টেক্সটে ফেরত দেখতে পারে না, এটাই সবচেয়ে নিরাপদ আচরণ। এই টেবিলটি
-- প্রজেক্ট মালিকের সুস্পষ্ট অনুরোধে ইচ্ছাকৃতভাবে একটি আলাদা জায়গায়
-- পাসওয়ার্ড প্লেইন টেক্সটে সংরক্ষণ করে — কারণ এখনো কোনো SMS/paid reset
-- provider যোগ করা হয়নি এবং সেলার সংখ্যা কম, তাই পাসওয়ার্ড ভুলে গেলে
-- Super Admin Panel থেকেই সাময়িকভাবে দেখে নেওয়া দরকার। প্রোডাকশনে
-- যাওয়ার আগে এই সিস্টেম সরিয়ে/আপগ্রেড করে নেওয়ার কথা মালিক নিজেই জানেন।
--
-- এই টেবিল কম্প্রোমাইজড হলে (Super Admin অ্যাকাউন্ট বা DB অ্যাক্সেস leak
-- হলে) সব ইউজারের পাসওয়ার্ড একসাথে exposed হয়ে যাবে — এই ঝুঁকি সম্পূর্ণ
-- বুঝেই যোগ করা হচ্ছে।
-- ============================================================

create table if not exists public.admin_saved_credentials (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  password text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

drop trigger if exists trg_admin_saved_credentials_updated_at on public.admin_saved_credentials;
create trigger trg_admin_saved_credentials_updated_at
  before update on public.admin_saved_credentials
  for each row execute procedure public.set_updated_at();

alter table public.admin_saved_credentials enable row level security;

-- পড়া (SELECT) — শুধুমাত্র Super Admin। সাধারণ ইউজার নিজেরটাও ফেরত পড়তে
-- পারবে না, শুধু লিখতে (নিচে) পারবে — তাহলেই Super Admin এটি দেখতে পাবেন।
drop policy if exists "admin_saved_credentials_select_super_admin" on public.admin_saved_credentials;
create policy "admin_saved_credentials_select_super_admin"
  on public.admin_saved_credentials for select
  using (public.is_super_admin());

-- লেখা (INSERT/UPDATE) — নিজের পাসওয়ার্ড নিজে সাইনআপ/পরিবর্তনের সময়
-- সংরক্ষণ করতে পারবে (user_id = নিজের auth.uid()), অথবা Super Admin যেকোনো
-- ইউজারের জন্য করতে পারবেন (reset password flow-এর জন্য)।
drop policy if exists "admin_saved_credentials_insert_self_or_super_admin" on public.admin_saved_credentials;
create policy "admin_saved_credentials_insert_self_or_super_admin"
  on public.admin_saved_credentials for insert
  with check (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "admin_saved_credentials_update_self_or_super_admin" on public.admin_saved_credentials;
create policy "admin_saved_credentials_update_self_or_super_admin"
  on public.admin_saved_credentials for update
  using (user_id = auth.uid() or public.is_super_admin())
  with check (user_id = auth.uid() or public.is_super_admin());

-- ডিলিট — শুধুমাত্র Super Admin
drop policy if exists "admin_saved_credentials_delete_super_admin" on public.admin_saved_credentials;
create policy "admin_saved_credentials_delete_super_admin"
  on public.admin_saved_credentials for delete
  using (public.is_super_admin());
