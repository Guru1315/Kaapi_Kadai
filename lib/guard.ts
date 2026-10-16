import { NextResponse } from 'next/server';
import type { ZodTypeAny, z } from 'zod';
import { serverClient } from './supabase';

// Simple in-memory rate limiter (per server instance). On Vercel's serverless
// platform, swap this for Upstash Redis (@upstash/ratelimit) so limits are shared.
const hits = new Map<string, { n: number; reset: number }>();
function limited(key: string, max = 30, windowMs = 60_000) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return false; }
  return ++h.n > max;
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// Runs on every API call: rate limit, same-origin check (CSRF), login check, Zod validation.
export async function guard<S extends ZodTypeAny>(req: Request, schema?: S) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (limited(`${ip}:${new URL(req.url).pathname}`)) return { res: fail('Too many requests. Try again in a minute.', 429) };

  if (req.method !== 'GET') {
    const origin = req.headers.get('origin');
    const allowed = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').origin;
    if (origin !== allowed) return { res: fail('Request blocked: wrong origin.', 403) };
  }

  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { res: fail('Please log in.', 401) };

  let body: z.infer<S> | undefined;
  if (schema) {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return { res: fail('Invalid input.', 400) };
    body = parsed.data;
  }
  return { supabase, user, body };
}
