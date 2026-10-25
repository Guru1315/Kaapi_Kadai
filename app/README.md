# app

The Next.js App Router folder. Every page and API route lives here.

| Path | What it is |
|---|---|
| `layout.tsx` | Root layout. Sets the page title and wraps everything in the `wrap` container |
| `page.tsx` | The home page, a server component. Loads the data for the shop |
| `Shop.tsx` | The shop UI, a client component (products, cart, orders, owner panel) |
| `globals.css` | Global styles |
| [`login/`](login/) | Login and sign-up page |
| [`auth/`](auth/) | Sign-in callback and sign-out routes |
| [`api/`](api/) | Products, cart and checkout API routes |

## How the home page loads

`page.tsx` runs on the server and is marked `force-dynamic`, so it is never cached. It asks Supabase for four things at the same time:

1. all products, oldest first
2. the signed-in user's cart lines
3. the user's 10 most recent orders
4. the user's profile role

The results are passed to `Shop` as props. `isAdmin` is true only when the role is `admin`, and that is what shows the owner's "Manage products" box. Row Level Security means each query only returns rows the user is allowed to see.

## How the shop talks to the server

`Shop.tsx` has one helper, `call(url, method, body)`. It sends JSON to an API route, shows any `error` message from the response, and then calls `router.refresh()` so the page reloads its data. React escapes everything it renders, so product names cannot inject HTML.

## Known gap

`Shop.tsx` calls some routes that are not in this repository yet. See [`api/README.md`](api/README.md#routes-the-page-calls-that-are-missing).
