import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe'; // Importe o tipo oficial

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature') as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const { type, data } = event;

  try {
  switch (type) {
    case 'checkout.session.completed': {
      const session = data.object as any;
      const userId = session.metadata?.userId;

      if (!userId) {
        return new NextResponse('No userId in metadata', { status: 400 });
      }

      // 1. Atualizar o perfil do utilizador
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: session.customer as string })
        .eq('id', userId);

      // 2. Procurar a assinatura (usando await direto para evitar o erro de tipo Response)
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;

      // 3. Inserir na tabela de subscrições
      const { error } = await supabaseAdmin.from('subscriptions').upsert({
        id: subscription.id,
        user_id: userId,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
        quantity: subscription.items.data[0].quantity || 1,
        cancel_at_period_end: subscription.cancel_at_period_end,
        // Conversão de Timestamps para ISO String garantida
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        created: new Date(subscription.created * 1000).toISOString(),
      });

      if (error) {
        console.error('Erro Supabase Subscriptions:', error.message);
        throw error;
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = data.object as any;
      
      // Procurar o user_id pelo stripe_customer_id guardado no perfil
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single();

      if (profile) {
        await supabaseAdmin.from('subscriptions').upsert({
          id: subscription.id,
          user_id: profile.id,
          status: subscription.status,
          price_id: subscription.items.data[0].price.id,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
      }
      break;
    }
  }
} catch (error: any) {
  console.error('Falha Crítica no Webhook:', error.message);
  return new NextResponse(`Erro: ${error.message}`, { status: 500 });
}

  return NextResponse.json({ received: true });
}