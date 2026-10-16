// Security headers: HTTPS-only (HSTS), no framing, no sniffing, and a strict
// Content-Security-Policy so injected scripts cannot run (XSS defence in depth).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // Next.js inline bootstrap; tighten with nonces if you add a CDN
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
].join('; ');

module.exports = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }];
  },
};
