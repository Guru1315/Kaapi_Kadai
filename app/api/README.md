# api

The server routes the shop page calls. All of them are protected the same way.

## What every route does first

Each route starts with `guard()` from [`lib/guard.ts`](../../lib/README.md), which checks these in order and stops at the first failure:

| Check | Fails with |
|---|---|
| Rate limit: 30 requests a minute per IP and route | `429` Too many requests |
| Same-origin check on anything that is not `GET` | `403` Request blocked: wrong origin |
| User must be logged in | `401` Please log in |
| Body must match the route's Zod schema (when it has one) | `400` Invalid input |

Only after that does the route touch the database, and it does so as the signed-in user, so Row Level Security still applies.

## Routes in this repository

| Folder | Method | What it does |
|---|---|---|
| [`products/`](products/) | `POST` | Owner adds a product |
| [`cart/`](cart/) | `POST` | Add one of a product to the user's cart |
| [`cheackout/`](cheackout/) | `POST` | Turn the cart into an order |

## Routes the page calls that are missing

`app/Shop.tsx` also sends these requests, but there is no matching route file in this repository, so they would return `404` here:

| Request from the page | Used for | Notes |
|---|---|---|
| `POST /api/checkout` | Place order | The folder is spelled `cheackout`, so the URL it serves is `/api/cheackout` |
| `PATCH /api/cart/{product_id}` with `{ "qty": n }` | Change quantity | The `cartQty` schema already exists in `lib/validators.ts` |
| `DELETE /api/cart/{product_id}` | Remove from cart | Needs `app/api/cart/[id]/route.ts` |
| `DELETE /api/products/{id}` | Owner deletes a product | Needs `app/api/products/[id]/route.ts`. The database policy for it already exists |

The `idParam` schema in `lib/validators.ts` is meant for these `[id]` routes.
