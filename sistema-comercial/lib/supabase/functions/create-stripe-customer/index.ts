import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const { record } = await req.json()

  try {
    // 1. Cria o cliente no Stripe
    const customer = await stripe.customers.create({
      email: record.email,
      metadata: { supabase_uuid: record.id }
    })

    // 2. Atualiza a sua tabela public.profiles com o ID do Stripe
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', record.id)

    if (error) throw error

    return new Response(JSON.stringify({ stripe_id: customer.id }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})