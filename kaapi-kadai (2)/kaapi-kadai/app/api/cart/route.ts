import { NextResponse } from 'next/server';
import { guard } from '@/lib/guard';
import { cartAdd } from '@/lib/validators';

// Insert: add one of a product to the signed-in user's cart.
export async function POST(req: Request) {
  const g = await guard(req, cartAdd);
  if (g.res) return g.res;
  const { data: existing } = await g.supabase
    .from('cart_items').select('qty').eq('product_id', g.body.product_id).maybeSingle();
  const qty = Math.min((existing?.qty ?? 0) + 1, 20);
  const { error } = await g.supabase
    .from('cart_items').upsert({ user_id: g.user.id, product_id: g.body.product_id, qty });
  if (error) return NextResponse.json({ error: 'Could not add.' }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
