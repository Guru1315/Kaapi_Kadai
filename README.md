<p align="center">
  <img src="docs/banner.svg" alt="Kaapi Kadai: filter coffee and tumblers" width="100%">
</p>

<p align="center">
  <a href="https://kaapi-kadai-sail22.vercel.app"><img alt="Live site" src="https://img.shields.io/badge/Live_site-open-2ea44f?style=for-the-badge&logo=vercel&logoColor=white"></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img alt="Zod" src="https://img.shields.io/badge/Zod-validated-3068B7?style=for-the-badge&logo=zod&logoColor=white">
</p>

# ☕ Kaapi Kadai

A small online shop for filter coffee and tumblers. 🛒 Customers log in, add products to a cart and place orders. 👑 The shop owner adds and deletes products.

🌍 **Live site:** https://kaapi-kadai-sail22.vercel.app

The Site`s UI may be looking not good or looking simple soon i will at that and i will make sure to look embrasse!

> 💡 If the site asks you to log in to Vercel, turn off Vercel Authentication: Vercel project > Settings > Deployment Protection.

## ✨ What it does

| | Feature | Who | How |
|---|---|---|---|
| 🔑 | Sign up and log in | Everyone | Email and password, or Google |
| 🛍️ | Browse products | Logged-in users | Products load from the database |
| 🧺 | Add to cart, change quantity, remove | Logged-in users | Each user sees only their own cart |
| 📦 | Place an order | Logged-in users | Total is worked out on the database from real prices |
| 🧾 | View past orders | Logged-in users | Each user sees only their own orders |
| 👑 | Add and delete products | Owner only | Enforced by database rules, not only by the page |

💳 Orders are recorded only. There is no payment step yet.

## 🧰 Built with

- ⚛️ Next.js 15 and React 19 (frontend and API routes)
- 🗄️ Supabase (Postgres database, login, Row Level Security)
- 🛡️ Zod (input validation)
- ▲ Vercel (hosting)

## 🔄 How a request flows

<p align="center">
  <img src="docs/architecture.svg" alt="A request goes from the browser to the Next.js API and then to the Supabase database" width="100%">
</p>

🧱 The database is the last line of defence. Even if the app code had a bug, Row Level Security would still block one user from touching another user's data.

## 🔐 Security

| # | | Item | Where it lives |
|---|---|---|---|
| 1 | 🔑 | Login required | `app/login/page.tsx`, `middleware.ts` |
| 2 | 🚧 | Users touch only their own data | Row Level Security policies in `supabase/schema.sql` |
| 3 | 🔒 | Password safety | Supabase Auth hashes passwords |
| 4 | ✅ | Input validation | Zod schemas in `lib/validators.ts`, run by `lib/guard.ts`; CHECK constraints in the database |
| 5 | 💉 | SQL injection | Only the Supabase client and one SQL function are used; no string-built SQL |
| 6 | 🕸️ | XSS | React escapes text; Content-Security-Policy in `next.config.js` |
| 7 | 🌐 | HTTPS | Served over HTTPS by Vercel; HSTS header in `next.config.js` |
| 8 | 🗝️ | Secrets | Kept in environment variables; `.env*` files are git-ignored |
| 9 | 🚦 | Rate limiting | `lib/guard.ts` (30 requests a minute per IP and route) |
| 10 | 🛂 | CSRF / CORS | Same-origin check in `lib/guard.ts`; no CORS headers are sent |
| 11 | 💾 | Backups | Supabase dashboard > Database > Backups (see limits below) |
| 12 | 📦 | Package updates | Run `npm audit` and `npm update` regularly |

## 📁 Project structure

```
app/
  api/            Products, cart and checkout routes
  auth/           Google and email callback, sign out
  login/          Login and sign-up page
  Shop.tsx        Shop page (products, cart, orders, owner panel)
lib/
  guard.ts        Rate limit, origin check, login check, validation
  supabase.ts     Server-side Supabase client
  validators.ts   Zod schemas
middleware.ts     Keeps the session fresh, redirects logged-out visitors
supabase/schema.sql   Tables, security rules, checkout function, sample products
docs/             Banner and diagram used in this README
```

## 💻 Run it on your computer

1. 🆕 Create a free project at supabase.com.
2. 🗄️ In the Supabase SQL Editor, open a new query, paste all of `supabase/schema.sql` and click Run. Run it once only.
3. 📝 Copy `.env.example` to `.env.local` and fill in the values from Supabase > Project Settings > API:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. 🚀 Run `npm install`, then `npm run dev`, then open http://localhost:3000.

## 🔵 Set up Google login

1. In Google Cloud Console, go to APIs & Services > Credentials > Create credentials > OAuth client ID > Web application.
2. Authorized JavaScript origins: your site address (for example `https://kaapi-kadai-sail22.vercel.app`) and `https://YOUR-PROJECT.supabase.co`.
3. Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
4. Copy the client ID and secret into Supabase > Authentication > Sign In / Providers > Google, turn it on and save.
5. In Supabase > Authentication > URL Configuration, set the Site URL to your site address and add `YOUR-SITE/auth/callback` to the redirect URLs.

## 👑 Make someone the owner

Sign up first, then run this in a new Supabase SQL query with the sign-up email:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

⚠️ "Success. No rows returned" appears even when nothing changed. To check, run `select * from public.profiles;`. The person must appear with the role `admin`. If the table is empty, the account was created before `schema.sql` ran; insert the profile by hand:

```sql
insert into public.profiles (id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict (id) do update set role = 'admin';
```

## 🚀 Deployment process

This is how the live site was set up.

1. 🗄️ **Database.** A Supabase project named `kaapi-kadai` was created (Mumbai region) and `supabase/schema.sql` was applied.
2. ▲ **Hosting project.** A Vercel project named `kaapi-kadai` was created with the Next.js framework.
3. 🔧 **Environment variables.** Three variables were added in Vercel for production, preview and development:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`, set to `https://kaapi-kadai-sail22.vercel.app`
4. 🏗️ **Deploy.** The project files were deployed to production. The first builds failed on a TypeScript error in the cookie handlers of `lib/supabase.ts` and `middleware.ts`. Typing the `setAll` parameter fixed it.
5. 🔵 **Login settings.** Google was enabled in Supabase and the redirect URLs were set (see "Set up Google login").

### 🔁 Deploy your own copy or redeploy

1. Push this folder to a GitHub repository.
2. In Vercel, click Add New > Project, import the repository and keep the Next.js settings.
3. Add the three environment variables above.
4. Set `NEXT_PUBLIC_SITE_URL` to the exact address Vercel gives you, with no trailing slash.
5. Click Deploy. After that, every push to `main` deploys automatically.

📍 Use the address in `NEXT_PUBLIC_SITE_URL` when you open the site. The app blocks changes made from any other address, such as `kaapi-kadai.vercel.app`, with "Request blocked: wrong origin".

## ⚠️ Known limits

- 💳 **No payments.** Add Razorpay or Stripe before charging real money.
- 🚦 **Rate limiting resets** when the server restarts or when Vercel runs a second instance. For strict limits, switch `lib/guard.ts` to Upstash Redis (`@upstash/ratelimit`).
- 💾 **Backups.** The free Supabase plan has no daily backups. Use the Pro plan or schedule `pg_dump`.
- ✏️ **Product editing.** The database allows owners to update products, but this repository has no `PUT /api/products/:id` route and the page has no edit button yet.
- 🧩 **Routes missing from this repository.** The page calls `/api/checkout`, `/api/cart/{id}` (change quantity, remove) and `/api/products/{id}` (delete). Here, the checkout folder is spelled `cheackout` and the `[id]` routes do not exist, so those buttons would fail until the routes are added. Details are in [`app/api/README.md`](app/api/README.md#routes-the-page-calls-that-are-missing).
- 🖼️ **Missing images.** `docs/banner.svg` and `docs/architecture.svg` are referenced at the top of this file but are not in the repository.
- 📧 **Email sending.** Supabase's built-in email sender is rate limited. Set up your own SMTP for production.
- 🧪 **Not fully tested.** The project builds and deploys, but the full flow (sign up, order, owner actions) has not been run end to end.

## 🧯 Troubleshooting

| Message | Cause and fix |
|---|---|
| `Unsupported provider: provider is not enabled` | Google is off in Supabase > Authentication > Providers. Turn it on. |
| `redirect_uri_mismatch` | The redirect URI in Google differs from `https://YOUR-PROJECT.supabase.co/auth/v1/callback`. Paste it exactly. |
| `relation "profiles" already exists` | `schema.sql` was already run. Do not run it again. |
| `Request blocked: wrong origin` | You opened the site from an address other than `NEXT_PUBLIC_SITE_URL`. |
| Site asks for a Vercel login | Turn off Vercel Authentication in Deployment Protection. |
| No "Manage products" box after logging in | Your account is not an owner. See "Make someone the owner". |
