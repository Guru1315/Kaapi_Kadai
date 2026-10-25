# auth/callback

`GET /auth/callback`

The page Supabase sends people back to after they sign in with Google or click the link in a confirmation email.

## What it does

1. Reads the `code` value from the URL.
2. If there is one, exchanges it for a login session with `exchangeCodeForSession`, which stores the session cookies.
3. Redirects to `/` on the site address in `NEXT_PUBLIC_SITE_URL` (or the request's own address if that is not set).

If the URL has no `code`, it skips step 2 and still redirects to `/`. A visitor without a session is then sent on to `/login` by `middleware.ts`.

## Setup it depends on

- Supabase > Authentication > URL Configuration: add `YOUR-SITE/auth/callback` to the redirect URLs.
- `NEXT_PUBLIC_SITE_URL` must match the address you open the site from.

The main [README](../../../README.md#-set-up-google-login) has the full Google login steps.

## Who calls it

- `app/login/page.tsx` sets this as the redirect target for Google sign-in (`redirectTo`) and for sign-up confirmation emails (`emailRedirectTo`).
- `middleware.ts` leaves `/auth` paths open, so logged-out visitors can reach it.
