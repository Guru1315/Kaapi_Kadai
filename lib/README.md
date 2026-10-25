# lib

Shared server code used by the API routes and pages.

| File | Purpose |
|---|---|
| `guard.ts` | Checks every API request: rate limit, same-origin, login, input validation |
| `supabase.ts` | Creates the server-side Supabase client |
| `validators.ts` | Zod schemas for request input |

## guard.ts

`guard(req, schema?)` returns either `{ res }` (a ready-made error response to return straight away) or `{ supabase, user, body }` when everything passed.

Typical use in a route:

```ts
const g = await guard(req, productInput);
if (g.res) return g.res;
// g.supabase, g.user and g.body are now safe to use
```

| Check | Detail |
|---|---|
| Rate limit | 30 requests per minute for each IP and path, kept in memory |
| Same origin | On non-`GET` requests the `Origin` header must equal the origin of `NEXT_PUBLIC_SITE_URL` (defaults to `http://localhost:3000`) |
| Login | Uses `supabase.auth.getUser()`; no user means `401` |
| Validation | Parses the JSON body with the given Zod schema; failure means `400` |

The rate limiter lives in one server instance's memory, so it resets on restart and is not shared when Vercel runs more than one instance. For strict limits, switch to Upstash Redis (`@upstash/ratelimit`), as the comment in the file suggests.

## supabase.ts

`serverClient()` builds a Supabase client from the request cookies. It acts as the signed-in user, so Row Level Security applies to every query. Setting cookies can fail in some server contexts, so that step is wrapped in a `try/catch`.

## validators.ts

| Schema | Used for | Rules |
|---|---|---|
| `productInput` | Adding a product | `name` 1-60 chars, `unit` 1-30 chars, `price_inr` whole number 1-100000 |
| `cartAdd` | Adding to cart | `product_id` is a UUID |
| `cartQty` | Changing quantity | `qty` whole number 1-20 |
| `idParam` | Ids in URLs | a UUID |

The object schemas are `.strict()`, so extra fields are rejected. `cartQty` and `idParam` are not used by any route in this repository yet; they are ready for the missing `[id]` routes (see [`app/api/README.md`](../app/api/README.md#routes-the-page-calls-that-are-missing)).
