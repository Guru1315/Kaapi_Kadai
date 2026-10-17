import { NextResponse } from 'next/server';
import { guard } from '@/lib/guard';
import { cartQty, idParam } from '@/lib/validators';

type Ctx = { params: Promise<{ id: string }> }; // id = product id

// Update quantity (only rows belonging to the user are visible, thanks to RLS).
export async function PATCH(req: Request, { params }: Ctx) {
  const id = idParam.safeParse((await params).id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const g = await guard(req, cartQty);
  if (g.res) return g.res;
  const { error } = await g.supabase
    .from('cart_items').update({ qty: g.body.qty }).eq('user_id', g.user.id).eq('product_id', id.data);
  if (error) return NextResponse.json({ error: 'Could not update.' }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// Delete: remove a product from the user's cart.
export async function DELETE(req: Request, { params }: Ctx) {
  const id = idParam.safeParse((await params).id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const g = await guard(req);
  if (g.res) return g.res;
  const { error } = await g.supabase
    .from('cart_items').delete().eq('user_id', g.user.id).eq('product_id', id.data);
  if (error) return NextResponse.json({ error: 'Could not remove.' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
