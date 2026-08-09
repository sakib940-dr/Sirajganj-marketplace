-- ============================================================
-- 0024: সেলার ভেরিফিকেশন রেকর্ড ডিলিট করার অনুমতি (Admin/Super Admin)
-- ============================================================
-- আগে seller_verifications টেবিলে কোনো DELETE পলিসি ছিল না, ফলে অ্যাডমিন
-- প্যানেল থেকে অনুমোদিত/প্রত্যাখ্যাত পুরনো ভেরিফিকেশন আবেদন (NID ছবি,
-- প্রোফাইল ছবি ইত্যাদিসহ) মুছে ফেলা সম্ভব ছিল না। storage bucket
-- ('seller-verification')-এ delete পলিসি আগে থেকেই যেকোনো authenticated
-- ইউজারের জন্য খোলা আছে (0005 মাইগ্রেশন দেখুন), তাই সেখানে নতুন কিছু
-- লাগেনি — শুধু টেবিল-লেভেল DELETE পলিসি যোগ করা হলো।
-- ============================================================

drop policy if exists "seller_verifications_delete_admin" on public.seller_verifications;
create policy "seller_verifications_delete_admin"
  on public.seller_verifications for delete
  using (public.is_admin_or_above());
