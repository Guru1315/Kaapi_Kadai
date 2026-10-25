# api/cheackout

Turns the signed-in user's cart into an order.

> **Heads up:** this folder is spelled `cheackout`, and Next.js uses the folder name as the URL, so this route is served at `/api/cheackout`. `app/Shop.tsx` calls `/api/checkout`. Renaming the folder to `checkout` makes the two match.

## `POST /api/checkout` (as written: `/api/cheackout`)

**Body:** none. The browser sends nothing, so there is nothing to tamper with.

**What it does**

It calls the database function `place_order()` (see [`supabase/schema.sql`](../../../supabase/README.md)), which:

1. Reads the real prices from the `products` table and works out the total.
2. Creates a row in `orders`.
3. Copies the cart into `order_items`, saving the name and price at the time of purchase.
4. Empties the user's cart.

**Responses**

| Status | Body | When |
|---|---|---|
| `201` | `{ "orderId": "uuid" }` | Order recorded |
| `400` | `{ "error": "Cart is empty or order failed." }` | Cart was empty, or the function failed |
| `401` / `403` / `429` | see [`../README.md`](../README.md) | `guard()` failed |

## Limits

- **No payment.** The order is only recorded. Add Razorpay or Stripe before charging real money.
- Only logged-in users can run `place_order()`; anonymous access is revoked in the schema.
