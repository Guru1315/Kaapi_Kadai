'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type Product = { id: string; name: string; unit: string; price_inr: number };
export type CartLine = { product_id: string; qty: number };
export type Order = { id: string; total_inr: number; created_at: string };

const rs = (n: number) => '₹' + n.toLocaleString('en-IN');

// React escapes all text it renders, so product names can never inject HTML or scripts.
export default function Shop(props: { products: Product[]; cart: CartLine[]; orders: Order[]; isAdmin: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [armed, setArmed] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', unit: '', price: '' });

  async function call(url: string, method: string, body?: unknown) {
    setMsg('');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(data.error ?? 'Something went wrong.');
    router.refresh();
    return res.ok;
  }

  const byId = new Map(props.products.map((p) => [p.id, p]));
  const lines = props.cart.filter((c) => byId.has(c.product_id));
  const total = lines.reduce((s, c) => s + c.qty * byId.get(c.product_id)!.price_inr, 0);

  return (
    <>
      <header>
        <div><h1>Kaapi Kadai</h1><span className="muted">Filter coffee &amp; tumblers, Chennai</span></div>
        <form action="/auth/signout" method="post"><button>Log out</button></form>
      </header>

      {props.isAdmin && (
        <section className="card">
          <b>Manage products (owner only)</b>
          <form className="row" onSubmit={async (e) => {
            e.preventDefault();
            const ok = await call('/api/products', 'POST', { name: form.name, unit: form.unit, price_inr: Number(form.price) });
            if (ok) setForm({ name: '', unit: '', price: '' });
          }}>
            <input placeholder="Name" maxLength={60} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Pack, e.g. 250 g" maxLength={30} required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <input placeholder="Price ₹" type="number" min={1} max={100000} required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <button className="primary">Add product</button>
          </form>
        </section>
      )}

      <div className="err" role="status">{msg}</div>

      <div className="grid">
        {props.products.map((p) => (
          <article className="card" key={p.id}>
            <span className="muted">{p.unit}</span>
            <h3>{p.name}</h3>
            <b>{rs(p.price_inr)}</b>
            <div className="row">
              <button className="primary" onClick={() => call('/api/cart', 'POST', { product_id: p.id })}>Add to cart</button>
              {props.isAdmin && (
                <button className="danger" onClick={async () => {
                  if (armed !== p.id) return setArmed(p.id);
                  setArmed(null);
                  await call(`/api/products/${p.id}`, 'DELETE');
                }}>{armed === p.id ? 'Tap again to delete' : 'Delete'}</button>
              )}
            </div>
          </article>
        ))}
      </div>

      <section>
        <h2>Your cart</h2>
        {lines.length === 0 && <p className="muted">Your cart is empty.</p>}
        {lines.map((c) => {
          const p = byId.get(c.product_id)!;
          return (
            <div className="line" key={c.product_id}>
              <span>{p.name} · {rs(p.price_inr)} × {c.qty}</span>
              <span className="row">
                <button aria-label="Fewer" disabled={c.qty <= 1} onClick={() => call(`/api/cart/${c.product_id}`, 'PATCH', { qty: c.qty - 1 })}>−</button>
                <button aria-label="More" disabled={c.qty >= 20} onClick={() => call(`/api/cart/${c.product_id}`, 'PATCH', { qty: c.qty + 1 })}>+</button>
                <button className="danger" onClick={() => call(`/api/cart/${c.product_id}`, 'DELETE')}>Remove</button>
              </span>
            </div>
          );
        })}
        {lines.length > 0 && (
          <p className="row"><b>Total {rs(total)}</b>
            <button className="primary" onClick={() => call('/api/checkout', 'POST')}>Place order</button>
          </p>
        )}
      </section>

      <section>
        <h2>Your orders</h2>
        {props.orders.length === 0 && <p className="muted">No orders yet.</p>}
        {props.orders.map((o) => (
          <div className="line" key={o.id}>
            <span>{new Date(o.created_at).toLocaleDateString('en-IN')}</span><b>{rs(o.total_inr)}</b>
          </div>
        ))}
      </section>
    </>
  );
}
