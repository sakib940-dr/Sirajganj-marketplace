-- ============================================================
-- Migration 0002 — profiles-এ email/phone যোগ, registration আপডেট
-- ============================================================

alter table public.profiles
  add column if not exists email text,
  add column if not exists phone text;

-- signup-এর সময় email ও phone (যদি metadata-তে দেওয়া থাকে) সংরক্ষণ করবে
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

-- বিদ্যমান ইউজারদের জন্য email ব্যাকফিল (auth.users থেকে) — সুপার অ্যাডমিন হিসেবে একবার রান করুন
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;
