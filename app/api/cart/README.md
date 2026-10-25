# api/cart

Adds items to the signed-in user's cart.

## `POST /api/cart`

Adds one of a product to the cart.

**Body**

```json
{ "product_id": "uuid-of-the-product" }
```

Unknown fields are rejected (`cartAdd` in `lib/validators.ts` is strict).

**What it does**

1. Looks up the current quantity of that product in the user's cart.
2. Adds 1, capped at 20.
3. Upserts the row, so a product is never listed twice.

**Responses**

| Status | Body | When |
|---|---|---|
| `201` | `{ "ok": true }` | Added |
| `400` | `{ "error": "Could not add." }` | Database refused it, for example an unknown product |
| `400` / `401` / `403` / `429` | see [`../README.md`](../README.md) | `guard()` failed |

## Why users cannot touch each other's carts

The `cart_items` table has a Row Level Security policy, `own cart`, that only allows rows where `user_id = auth.uid()`. The route also sets `user_id` from the logged-in user, never from the request.

## Not here yet

The page also sends `PATCH /api/cart/{product_id}` (change quantity) and `DELETE /api/cart/{product_id}` (remove). Those route files are not in this repository. See [`../README.md`](../README.md#routes-the-page-calls-that-are-missing).
