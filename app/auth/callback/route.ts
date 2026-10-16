import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase';

// Google sign-in and email confirmation links land here.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code');
  if (code) await (await serverClient()).auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? req.url));
}
