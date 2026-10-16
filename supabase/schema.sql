-- Run this once in Supabase: SQL Editor > New query > paste > Run.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin'))
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  unit text not null check (char_length(unit) between 1 and 30),
  price_inr integer not null check (price_inr between 1 and 100000),
  created_at timestamptz not null default now()
);

create table public.cart_items (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  qty integer not null check (qty between 1 and 20),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  total_inr integer not null,
  created_at timestamptz not null default now()
);

create table public.order_items (
  order_id uuid not null references public.orders on delete cascade,
  name text not null,
  price_inr integer not null,
  qty integer not null
);

-- Every new sign-up gets a customer profile.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Row Level Security: nothing is readable or writable unless a policy allows it.
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

create policy "read own profile"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "read products"      on public.products for select to authenticated using (true);
create policy "admin adds products"    on public.products for insert to authenticated with check (public.is_admin());
create policy "admin edits products"   on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes products" on public.products for delete to authenticated using (public.is_admin());
create policy "own cart" on public.cart_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "read own orders" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "read own order lines" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
-- No insert policy on orders/order_items: orders can only be created by place_order() below.

-- Checkout runs on the server and uses the real prices from the products table.
create function public.place_order() returns uuid
language plpgsql security definer set search_path = public as $$
declare oid uuid; tot integer;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select coalesce(sum(p.price_inr * c.qty), 0) into tot
    from cart_items c join products p on p.id = c.product_id where c.user_id = auth.uid();
  if tot = 0 then raise exception 'cart is empty'; end if;
  insert into orders (user_id, total_inr) values (auth.uid(), tot) returning id into oid;
  insert into order_items (order_id, name, price_inr, qty)
    select oid, p.name, p.price_inr, c.qty from cart_items c join products p on p.id = c.product_id
    where c.user_id = auth.uid();
  delete from cart_items where user_id = auth.uid();
  return oid;
end $$;
revoke all on function public.place_order() from public, anon;
grant execute on function public.place_order() to authenticated;

insert into public.products (name, unit, price_inr) values
  ('Peaberry Filter Coffee', '250 g', 320),
  ('Chicory Blend 80:20', '500 g', 410),
  ('Brass Davara Set', 'Tumbler and saucer', 749),
  ('Steel Coffee Filter', '4 cup', 560);

-- To make yourself the shop owner, after signing up once:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
