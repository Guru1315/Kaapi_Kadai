# Kaapi Kadai

A small online shop built with Next.js and Supabase. Customers log in, add products to a cart and place orders. The owner adds and deletes products.

## Set up

1. Create a free project at supabase.com.
2. In the SQL Editor, paste and run `supabase/schema.sql`.
3. In Authentication > Providers, keep Email on. Turn on Google and add your Google client ID and secret.
4. In Authentication > URL Configuration, add your site address and `/auth/callback` to the redirect URLs.
5. Copy `.env.example` to `.env.local` and fill in the three values.
6. Run `npm install`, then `npm run dev`, and open http://localhost:3000.
7. Sign up, then make yourself the owner by running the last line in `schema.sql` with your email.

## Deploy

Push to GitHub (`.env.local` is ignored, so your keys stay private) and import the repo on Vercel. Add the three environment variables in Vercel project settings, and set `NEXT_PUBLIC_SITE_URL` to your live address.

## Where each security item lives

| # | Item | Where |
|---|---|---|
| 1 | Login | `app/login/page.tsx`, `middleware.ts` |
| 2 | Own data only | Row Level Security policies in `supabase/schema.sql` |
| 3 | Password safety | Supabase Auth hashes passwords |
| 4 | Input validation | Zod schemas in `lib/validators.ts`, run by `lib/guard.ts`; database CHECK constraints as a second layer |
| 5 | SQL injection | Supabase client and a SQL function use parameters only; no string-built SQL |
| 6 | XSS | React escapes text; strict Content-Security-Policy in `next.config.js` |
| 7 | HTTPS | Vercel serves HTTPS; HSTS header in `next.config.js` |
| 8 | Secrets | `.env.local`, ignored by git; only the public anon key is in the browser |
| 9 | Rate limiting | `lib/guard.ts` (30 requests a minute per IP and route) |
| 10 | CSRF / CORS | Same-origin check in `lib/guard.ts`; no CORS headers are sent |
| 11 | Backups | Supabase dashboard > Database > Backups (daily on paid plans; see below) |
| 12 | Updates | Run `npm audit` and `npm update` regularly |

## Things you still need to do yourself

- **Backups:** the free Supabase plan has no daily backups. Upgrade to Pro for daily backups, or run `pg_dump` on a schedule.
- **Rate limiting on Vercel:** the in-memory limiter resets per server instance. For strict limits, switch `lib/guard.ts` to Upstash Redis (`@upstash/ratelimit`).
- **Payments:** orders are recorded only. Add Razorpay or Stripe before charging real money.
- **Email confirmation:** Supabase's built-in email sender is rate limited. Set up your own SMTP for production.
