import { NextResponse } from 'next/server';
import { guard } from '@/lib/guard';

// Prices are read from the database inside place_order(); the browser sends nothing to tamper with.
// This records the order only. Add a payment gateway (Razorpay, Stripe) before charging real money.
export async function POST(req: Request) {
  const g = await guard(req);
  if (g.res) return g.res;
  const { data, error } = await g.supabase.rpc('place_order');
  if (error) return NextResponse.json({ error: 'Cart is empty or order failed.' }, { status: 400 });
  return NextResponse.json({ orderId: data }, { status: 201 });
}
