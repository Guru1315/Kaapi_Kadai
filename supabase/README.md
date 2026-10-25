# supabase

`schema.sql` sets up the whole database. Run it **once**: Supabase dashboard > SQL Editor > New query > paste the file > Run. Running it twice fails with `relation "profiles" already exists`.

## Tables

| Table | Holds | Notable rules |
|---|---|---|
| `profiles` | One row per user, with a `role` | Role is `customer` (default) or `admin` |
| `products` | What the shop sells | `name` 1-60 chars, `unit` 1-30 chars, `price_inr` 1-100000 |
| `cart_items` | A user's cart lines | One row per user and product; `qty` 1-20 |
| `orders` | A placed order and its total | Created only by `place_order()` |
| `order_items` | The lines of an order | Stores name and price at the time of purchase |

## Row Level Security

RLS is switched on for every table, so nothing is readable or writable unless a policy allows it.

| Policy | Table | Who and what |
|---|---|---|
| read own profile | `profiles` | A user can read only their own row |
| read products | `products` | Any logged-in user can read |
| admin adds / edits / deletes products | `products` | Only users where `is_admin()` is true |
| own cart | `cart_items` | A user can do anything, but only to their own rows |
| read own orders | `orders` | A user can read only their own orders |
| read own order lines | `order_items` | A user can read lines of their own orders |

There is deliberately no insert policy on `orders` or `order_items`.

## Functions and trigger

| Name | What it does |
|---|---|
| `handle_new_user()` + trigger `on_auth_user_created` | Creates a `customer` profile for every new sign-up |
| `is_admin()` | True when the current user's role is `admin`; used by the product policies |
| `place_order()` | Totals the cart using real prices, writes the order and its lines, then empties the cart. Fails if the user is not signed in or the cart is empty |

`place_order()` is the only way to create an order. Anonymous users cannot run it; only `authenticated` users can.

## Sample data

The script inserts four products:

| Name | Pack | Price |
|---|---|---|
| Peaberry Filter Coffee | 250 g | ₹320 |
| Chicory Blend 80:20 | 500 g | ₹410 |
| Brass Davara Set | Tumbler and saucer | ₹749 |
| Steel Coffee Filter | 4 cup | ₹560 |

## Making someone the owner

Sign up first, then run the `update public.profiles set role = 'admin' ...` query from the main [README](../README.md#-make-someone-the-owner).
