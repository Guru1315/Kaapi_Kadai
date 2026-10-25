# login

`/login`: the sign-in and sign-up page. It is a client component, so the Supabase calls run in the browser.

## What the page offers

| Button | What happens |
|---|---|
| Log in | Signs in with email and password, then goes to `/` |
| Sign up | Creates the account and asks the person to check their email to confirm it |
| Continue with Google | Starts Google sign-in through Supabase |

## Rules and messages

- The password must be at least 8 characters. Shorter ones are rejected before anything is sent.
- Any error from Supabase is shown in the message line under the form.
- After a successful sign-up the page shows: *Check your email to confirm your account, then log in.*

## How it fits together

- Passwords are never stored by the app. Supabase Auth hashes and stores them.
- Both sign-up confirmation and Google sign-in send the person back to [`/auth/callback`](../auth/callback/README.md).
- `middleware.ts` treats `/login` as an open page, so logged-out visitors are not redirected away from it. Everything else sends them here.

## Needs these environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

See `.env.example` in the project root.
