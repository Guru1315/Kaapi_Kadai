import { NextResponse } from 'next/server';
import { guard } from '@/lib/guard';
import { productInput } from '@/lib/validators';

// Create (admin only: enforced by Row Level Security, not just by this code).
export async function POST(req: Request) {
  const g = await guard(req, productInput);
  if (g.res) return g.res;
  const { error } = await g.supabase.from('products').insert(g.body);
  if (error) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
