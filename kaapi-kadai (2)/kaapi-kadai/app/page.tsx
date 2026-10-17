import { serverClient } from '@/lib/supabase';
import Shop from './Shop';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sb = await serverClient();
  const { data: { user } } = await sb.auth.getUser();
  const [products, cart, orders, profile] = await Promise.all([
    sb.from('products').select('id,name,unit,price_inr').order('created_at'),
    sb.from('cart_items').select('product_id,qty'),
    sb.from('orders').select('id,total_inr,created_at').order('created_at', { ascending: false }).limit(10),
    sb.from('profiles').select('role').eq('id', user?.id ?? '').maybeSingle(),
  ]);
  return (
    <Shop
      products={products.data ?? []}
      cart={cart.data ?? []}
      orders={orders.data ?? []}
      isAdmin={profile.data?.role === 'admin'}
    />
  );
}
