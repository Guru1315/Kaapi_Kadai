# api/products

Lets the shop owner add products.

## `POST /api/products`

**Body**

```json
{ "name": "Peaberry Filter Coffee", "unit": "250 g", "price_inr": 320 }
```

| Field | Rule |
|---|---|
| `name` | Text, 1 to 60 characters, trimmed |
| `unit` | Text, 1 to 30 characters, trimmed |
| `price_inr` | Whole number, 1 to 100000 |

Unknown fields are rejected (`productInput` in `lib/validators.ts` is strict).

**Responses**

| Status | Body | When |
|---|---|---|
| `201` | `{ "ok": true }` | Product added |
| `403` | `{ "error": "Not allowed." }` | The user is not an owner |
| `400` / `401` / `403` / `429` | see [`../README.md`](../README.md) | `guard()` failed |

## Who can add products

Only an owner (`profiles.role = 'admin'`). This is enforced by the `admin adds products` policy in the database, not by this route, so a customer who calls the API directly is refused too. To make someone an owner, see the main [README](../../../README.md#-make-someone-the-owner).

## Reading products

There is no `GET` route. The home page (`app/page.tsx`) reads the `products` table straight from Supabase, and any logged-in user is allowed to read it.

## Not here yet

The page sends `DELETE /api/products/{id}` when the owner deletes a product. That route file is not in this repository. See [`../README.md`](../README.md#routes-the-page-calls-that-are-missing).
