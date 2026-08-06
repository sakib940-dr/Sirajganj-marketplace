# বাজার — বাংলা Local Marketplace (MVP v1)

React + Vite + Tailwind + shadcn/ui + Supabase দিয়ে তৈরি একটি সম্পূর্ণ বাংলা মাল্টি-শপ মার্কেটপ্লেস।

## ১. Tech Stack

- React 18 + Vite
- Tailwind CSS + shadcn/ui (component pattern)
- Supabase (Auth, PostgreSQL, Storage)
- React Router v6
- GitHub + Vercel (deployment)

## ২. প্রজেক্ট চালু করার ধাপ

### ধাপ ১ — Dependencies ইনস্টল করুন

```bash
npm install
```

### ধাপ ২ — Supabase Project তৈরি করুন

1. [supabase.com](https://supabase.com) এ গিয়ে একটি নতুন Project তৈরি করুন।
2. Project Settings → API থেকে **Project URL** ও **anon public key** কপি করুন।

### ধাপ ৩ — Environment Variable সেট করুন

`.env.example` ফাইলটি কপি করে `.env` বানান এবং মান বসান:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### ধাপ ৪ — Database Migration রান করুন

Supabase Dashboard → **SQL Editor** এ গিয়ে `supabase/migrations/0001_init.sql` ফাইলের সম্পূর্ণ কন্টেন্ট কপি-পেস্ট করে Run করুন।

এতে তৈরি হবে:
- ৮টি টেবিল (`profiles`, `shops`, `categories`, `products`, `product_images`, `shop_gallery`, `banners`, `site_settings`)
- Row Level Security (RLS) পলিসি সব টেবিলে
- Signup হলে স্বয়ংক্রিয়ভাবে `profiles` তৈরি হওয়ার Trigger
- `request_seller_status()` RPC — ভিজিটর নিরাপদে সেলার হওয়ার আবেদন করতে পারবে
- ৫টি Storage Bucket (`shop-logos`, `shop-banners`, `shop-gallery`, `product-images`, `site-assets`)

### ধাপ ৫ — নিজেকে প্রথম Super Admin বানান

1. প্রথমে ওয়েবসাইটে সাধারণভাবে Register করুন (`/register`)।
2. Supabase SQL Editor-এ গিয়ে (মাইগ্রেশন ফাইলের একদম শেষে থাকা কমেন্ট দেখুন):

```sql
update public.profiles
set role = 'super_admin', seller_status = 'none'
where id = (select id from auth.users where email = 'your-admin-email@example.com');
```

### ধাপ ৬ — Development সার্ভার চালু করুন

```bash
npm run dev
```

`http://localhost:5173` এ ওয়েবসাইট দেখা যাবে।

## ৩. GitHub-এ পুশ করা

```bash
git init
git add .
git commit -m "Initial commit: Bangla Marketplace MVP"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## ৪. Vercel-এ Deploy করা

1. [vercel.com](https://vercel.com) এ গিয়ে GitHub রিপোজিটরি Import করুন।
2. Framework Preset: **Vite** (স্বয়ংক্রিয়ভাবে সনাক্ত হবে)।
3. Environment Variables যোগ করুন (Vercel Project Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy চাপুন।

## ৫. প্রজেক্ট স্ট্রাকচার সংক্ষেপে

```
src/
├── components/    # ui, layout, shared, auth, seller, admin কম্পোনেন্ট
├── constants/     # roles.js, routes.js
├── context/       # AuthContext (session + role + seller_status)
├── hooks/         # useAuth, useCategories, useShops, useProducts
├── layouts/       # MainLayout, DashboardLayout, AdminLayout
├── pages/         # public/, seller/, admin/
├── routes/        # AppRoutes.jsx — সব route এখানে
└── lib/           # supabaseClient.js, utils.js
```

## ৬. User Role ও Access

| Role | Access |
|---|---|
| Visitor | Homepage, Category, Shop, Product দেখা, Search, Register |
| Seller (Pending) | Dashboard-এ শুধু "অনুমোদনের অপেক্ষায়" বার্তা দেখতে পারবে |
| Seller (Approved) | নিজের Shop/Product/Gallery ম্যানেজ করতে পারবে |
| Super Admin | সম্পূর্ণ Admin Panel — Seller Approval, Category, Product, Banner, Settings |

## ৭. বর্তমান Development Status

- ✅ Phase 0 — Project Setup
- ✅ Phase 1 — Database, RLS, Authentication (email + phone সহ Registration)
- ✅ Phase 2 — Public Website (Homepage, Category, Shop, Product, Search, WhatsApp Buy বাটন)
- ✅ Phase 3 — Seller Dashboard (Shop Info, Product CRUD, Gallery — সবই কার্যকর, ছবি আপলোডে ১০০ KB সীমা)
- ✅ Phase 4 — Admin Panel (User Management, Seller Approval, Category, Product, Banner, Site Settings — সবই কার্যকর)
- ⬜ Phase 5 — Polish, Full Responsive QA ও Final Deployment Testing

## ৮. গুরুত্বপূর্ণ নিরাপত্তা নোট

- **Password কখনো plain text-এ কোথাও সংরক্ষণ করা হয় না** — Supabase Auth নিজেই hash করে রাখে, Admin Panel থেকেও তা দেখা যায় না। এটি একটি ইচ্ছাকৃত ডিজাইন সিদ্ধান্ত, নিরাপত্তার জন্য।
- নতুন Admin account সরাসরি email/password দিয়ে তৈরি করা হয় না (এতে `service_role` key browser-এ এক্সপোজ করা লাগতো, যা নিরাপদ না)। বদলে, **যেকোনো Registered User-কে "ব্যবহারকারী ম্যানেজমেন্ট" পেজ থেকে Admin বানানো/সরানো যায়** — একই ফলাফল, নিরাপদ পদ্ধতিতে।
- সেলার ছবি আপলোডের সময় ১০০ KB সীমা ক্লায়েন্ট সাইডে চেক করা হয় — Image Resizer (TinyPNG, Squoosh ইত্যাদি) দিয়ে ছবি ছোট করার নির্দেশনা ফর্মেই দেখানো হয়।
- Shop-এর URL (`/shop/slug`) আসলে path-based — সত্যিকারের Subdomain (যেমন `shopname.yoursite.com`) চাইলে Vercel-এ Wildcard Domain কনফিগার করতে হবে এবং আলাদা DNS + middleware সেটআপ লাগবে, যা এই MVP-তে নেই।

`supabase/migrations/0002_profiles_contact_info.sql` — এই মাইগ্রেশনটিও `0001_init.sql`-এর পর SQL Editor-এ রান করতে হবে (email/phone কলাম যোগ করার জন্য)।
