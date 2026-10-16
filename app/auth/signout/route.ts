import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase';

export async function POST(req: Request) {
  await (await serverClient()).auth.signOut();
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL ?? req.url), 303);
}
