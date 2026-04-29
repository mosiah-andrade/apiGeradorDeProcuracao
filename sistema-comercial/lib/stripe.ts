// lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não configurada no .env.local');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Remova a linha apiVersion ou use uma versão estável conhecida:
  apiVersion: '2024-12-18.acacia' as any, 
  typescript: true,
});