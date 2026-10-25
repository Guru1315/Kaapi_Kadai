# auth/signout

`POST /auth/signout`

Logs the user out.

## What it does

1. Calls Supabase `signOut()`, which clears the session cookies.
2. Redirects to `/login` with status `303`, so the browser follows with a `GET`.

The redirect goes to `NEXT_PUBLIC_SITE_URL` when it is set, otherwise to the request's own address.

## Who calls it

The "Log out" button in `app/Shop.tsx`. It is a plain HTML form (`action="/auth/signout" method="post"`), so it works without any client-side code.

## Good to know

- It only accepts `POST`, which stops a link or image on another site from logging someone out.
- It does not run `guard()` from `lib/guard.ts`, so the rate limit and same-origin check are not applied here. Signing out when already logged out is harmless.
