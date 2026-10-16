import { z } from 'zod';

// Every API route parses its input with one of these. Unknown fields are rejected.
export const productInput = z.object({
  name: z.string().trim().min(1).max(60),
  unit: z.string().trim().min(1).max(30),
  price_inr: z.number().int().min(1).max(100000),
}).strict();

export const cartAdd = z.object({
  product_id: z.string().uuid(),
}).strict();

export const cartQty = z.object({
  qty: z.number().int().min(1).max(20),
}).strict();

export const idParam = z.string().uuid();
