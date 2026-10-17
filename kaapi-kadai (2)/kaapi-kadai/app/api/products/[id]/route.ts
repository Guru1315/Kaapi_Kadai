import { NextResponse } from 'next/server';
import { guard } from '@/lib/guard';
import { idParam, productInput } from '@/lib/validators';

type Ctx = { params: Promise<{ id: string }> };

// Update (admin only).
export async function PUT(req: Request, { params }: Ctx) {
  const id = idParam.safeParse((await params).id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const g = await guard(req, productInput);
  if (g.res) return g.res;
  const { data, error } = await g.supabase.from('products').update(g.body).eq('id', id.data).select('id');
  if (error || !data?.length) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  return NextResponse.json({ ok: true });
}

// Delete (admin only).
export async function DELETE(req: Request, { params }: Ctx) {
  const id = idParam.safeParse((await params).id);
  if (!id.success) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  const g = await guard(req);
  if (g.res) return g.res;
  const { data, error } = await g.supabase.from('products').delete().eq('id', id.data).select('id');
  if (error || !data?.length) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  return NextResponse.json({ ok: true });
}
