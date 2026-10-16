'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Login with email + password or Google. Supabase hashes passwords; the app never sees them stored.
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  async function submit(mode: 'in' | 'up') {
    setMsg('');
    if (password.length < 8) return setMsg('Use a password of at least 8 characters.');
    const { error } = mode === 'in'
      ? await sb.auth.signInWithPassword({ email, password })
      : await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback` } });
    if (error) return setMsg(error.message);
    if (mode === 'up') return setMsg('Check your email to confirm your account, then log in.');
    window.location.href = '/';
  }

  return (
    <main style={{ maxWidth: 380, margin: '10vh auto' }}>
      <h1>Kaapi Kadai</h1>
      <p className="muted">Log in to browse and order.</p>
      <div className="card">
        <input id="email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input id="password" type="password" autoComplete="current-password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="row">
          <button className="primary" onClick={() => submit('in')}>Log in</button>
          <button onClick={() => submit('up')}>Sign up</button>
        </div>
        <button onClick={() => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${origin}/auth/callback` } })}>
          Continue with Google
        </button>
        <div className="err" role="status">{msg}</div>
      </div>
    </main>
  );
}
