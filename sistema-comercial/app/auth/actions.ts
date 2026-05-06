// app/auth/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/mail'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { gerarPdfProposta } from '@/lib/pdf-generator'
import { resend } from '@/lib/mail'
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=Falha na autenticação')
  }

  // Redireciona para o dashboard do sistema comercial
  redirect('/')
}

export async function signUp(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: 'https://app.asaweb.tech/auth/callback',
    }
  })

  // 1. Tratamento de Erros
  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este e-mail já está cadastrado.' }
    }
    return { error: error.message }
  }

  // 2. Ações disparadas após criação bem-sucedida (Boas-vindas)
  if (data?.user) {
    try {
      // Disparamos o e-mail de marketing/boas-vindas antes de qualquer redirecionamento
      await sendWelcomeEmail(email, fullName)
    } catch (e) {
      console.error("Falha ao disparar e-mail de boas-vindas:", e)
      // Seguimos em frente para não frustrar o usuário por um erro de SMTP
    }
  }

  // 3. Lógica de Redirecionamento Baseada na Sessão
  // Se a confirmação de e-mail estiver ativa no Supabase, data.session será null
  if (data.user && !data.session) {
    redirect('/auth/verificar-email')
  }

  // Se a confirmação estiver desativada, ele cai aqui e vai para a home
  redirect('/')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Essa é a página que o usuário cairá depois de clicar no e-mail
    redirectTo: `${siteUrl}/auth/reset-password/confirm`,
  });

  if (error) {
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/login?message=Link enviado! Verifique sua caixa de entrada.');
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    // Redireciona de volta com o erro amigável
    redirect(`/auth/reset-password/confirm?error=${encodeURIComponent(error.message)}`);
  }

  // CORREÇÃO: Adicionada a barra antes de 'message' para uma rota válida
  redirect('/?message=Senha atualizada com sucesso');
}

export async function criarProposta(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // === 0. VERIFICAÇÃO DE REGRA DE NEGÓCIO (LIMITES) ===
  // Chamamos a função RPC que criamos no Supabase
  const { data: canCreate, error: rpcError } = await supabase.rpc('can_user_create_proposta', { 
    target_user_id: user.id 
  });

  if (rpcError) {
    console.error("Erro ao verificar limites:", rpcError);
    return { error: "Erro interno ao verificar permissões de uso." };
  }

  if (!canCreate) {
    return { 
      error: "Você atingiu o limite de 20 propostas mensais do plano gratuito. Faça upgrade para o PRO para uso ilimitado!" 
    };
  }
  // ===================================================

  // 1. Coleta de Dados Básicos e Itens
  const cliente_name = formData.get('cliente') as string
  const cliente_email = formData.get('cliente_email') as string
  const potencia_kwp = Number(formData.get('potencia'))
  const valor_total = Number(formData.get('valor'))
  const itens_config = JSON.parse(formData.get('itens_lista') as string)

  // 2. Coleta de Campos de Viabilidade Técnica
  const consumo_mensal = Number(formData.get('consumo_mensal'))
  const geracao_estimada = Number(formData.get('geracao_estimada'))
  const payback_anos = Number(formData.get('payback_anos'))

  // 3. Persistência no Banco de Dados
  const { data: proposta, error } = await supabase.from('propostas').insert({
    user_id: user.id,
    cliente_name,
    cliente_email,
    valor_total,
    potencia_kwp,
    itens_config,
    consumo_mensal,
    geracao_estimada,
    payback_anos,
  }).select().single()

  if (error || !proposta) return { error: "Erro ao salvar proposta no banco de dados." }

  // 4. Automação de PDF e E-mail
  try {
    const pdf = await gerarPdfProposta({
      id: proposta.id,
      cliente: proposta.cliente_name,
      potencia: proposta.potencia_kwp,
      valor: proposta.valor_total,
      itens: itens_config,
      consumo_mensal,
      geracao_estimada,
      payback_anos
    })
    
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    const safeName = cliente_name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_')
    const recipients = [user.email, cliente_email].filter(Boolean) as string[]

    await resend.emails.send({
      from: 'Asaweb <noreply@asaweb.tech>',
      to: recipients,
      replyTo: user.email!,
      subject: `📄 Proposta Comercial Solar - ${cliente_name}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Olá, ${cliente_name}!</h2>
          <p>Sua proposta de energia solar personalizada está pronta.</p>
          <p><strong>Destaques do Projeto:</strong></p>
          <ul>
            <li>Potência: ${potencia_kwp} kWp</li>
            <li>Geração Média: ${geracao_estimada} kWh/mês</li>
            <li>Retorno Estimado: ${payback_anos} anos</li>
          </ul>
          <p>Confira o detalhamento completo no <strong>PDF em anexo</strong>.</p>
        </div>
      `,
      attachments: [{
        filename: `Proposta_Solar_${safeName}.pdf`,
        content: pdfBuffer,
      }],
    })
  } catch (err) {
    console.error("Falha na automação de e-mail/PDF:", err)
    // Opcional: retornar sucesso mesmo se o e-mail falhar, pois o banco já foi salvo
  }

  revalidatePath('/')
  return { success: true }
}


export async function reenviarEmailProposta(propostaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { data: proposta } = await supabase.from('propostas').select('*').eq('id', propostaId).single();
  if (!proposta) throw new Error("Proposta não encontrada");

  const { data: perfil } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

  const pdf = await gerarPdfProposta(proposta, perfil);
  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

  // Correção da lógica 'to' (anteriormente usava &&, o que era um erro)
  const recipients = [user.email].filter(Boolean) as string[];
  if (proposta.cliente_email) recipients.push(proposta.cliente_email);

  await resend.emails.send({
    from: 'Asaweb <noreply@asaweb.tech>',
    to: recipients,
    replyTo: user.email!,
    subject: `Reenvio: Proposta Comercial - ${proposta.cliente_name}`,
    html: renderWhitelabelHTML(proposta.cliente_name, user.user_metadata?.full_name),
    attachments: [{ filename: `Proposta_${proposta.cliente_name}.pdf`, content: pdfBuffer }],
  });

  return { success: true };
}

// Função auxiliar para manter o e-mail Whitelabel limpo
function renderWhitelabelHTML(cliente: string, consultor?: string) {
  return `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <h2 style="color: #1e3a8a;">Olá, ${cliente}!</h2>
      <p>Sua proposta comercial personalizada já está pronta para análise.</p>
      <p>No <strong>PDF em anexo</strong>, você encontrará o detalhamento dos equipamentos, cronograma de instalação e a estimativa de economia para seu projeto solar.</p>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">
        Documento gerado via <strong>Asaweb</strong> • ${consultor || 'Consultoria Técnica'}
      </p>
    </div>
  `;
}

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Sessão expirada." };

  const updates = {
    id: user.id, // O ID deve ser exatamente o UUID do Auth
    full_name: formData.get('full_name'),
    company_name: formData.get('company_name'),
    phone: formData.get('phone'),
    website: formData.get('website'),
    avatar_url: formData.get('avatar_url'),
    company_logo_url: formData.get('company_logo_url'),
    updated_at: new Date().toISOString(),
  };

  // Use o .select() no final para garantir que o PostgREST entenda a operação
  const { error } = await supabase
    .from('profiles')
    .upsert(updates, { onConflict: 'id' }) 
    .select();

  if (error) {
    console.error("Erro Supabase:", error.message);
    return { error: "Falha ao salvar. Verifique se o banco de dados foi atualizado." };
  }

  revalidatePath('/perfil');
  return { success: true };
}

export async function checkoutAction(formData: FormData) {
  console.log("1. Action disparada!");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Coletar o ID do Preço vindo do formulário
  const priceId = formData.get('priceId') as string;
  console.log("2. ID capturado:", priceId);
  if (!priceId) {
    throw new Error("ID do preço não encontrado.");
  }

  // 2. TRAVA DE SEGURANÇA: Verificar se já existe assinatura ativa
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (sub) {
    // Em vez de throw, podemos redirecionar para o dashboard para uma melhor UX
    
    redirect('/?error=ja_assinante');
  }

  // 3. Criar a Sessão de Checkout no Stripe
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/planos`,
    metadata: {
      userId: user.id, // ESSENCIAL para o seu Webhook funcionar
    },
  });


  revalidatePath('/'); // Limpa o cache da home


  // 4. REDIRECIONAR O USUÁRIO PARA O STRIPE
  if (session.url) {
    console.log("3. Tentando redirecionar para o Stripe...");
    redirect(session.url);
  } else {
    throw new Error("Erro ao criar sessão de checkout.");
  }
}

export async function syncStripeProducts() {
  const products = await stripe.products.list();
  
  for (const product of products.data) {
    // Upsert no Produto
    await supabaseAdmin.from('products').upsert({
      id: product.id,
      active: product.active,
      name: product.name,
      description: product.description,
      image: product.images[0] || null,
      metadata: product.metadata,
    });

    // Busca e Upsert nos Preços deste produto
    const prices = await stripe.prices.list({ product: product.id });
    for (const price of prices.data) {
      await supabaseAdmin.from('prices').upsert({
        id: price.id,
        product_id: price.product as string,
        active: price.active,
        currency: price.currency,
        type: price.type,
        unit_amount: price.unit_amount,
        interval: price.recurring?.interval,
        interval_count: price.recurring?.interval_count,
        metadata: price.metadata,
      });
    }
  }
}


export async function createCustomerPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  // Se ele nem tem ID, manda contratar um plano
  if (!profile?.stripe_customer_id) {
    redirect('/planos');
  }

  try {
    // Tenta gerar o link para o portal
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/perfil`, 
    });

    redirect(session.url);
  } catch (error: any) {
    // SE O ERRO FOR "No such customer", limpamos o ID errado do banco
    if (error.raw?.code === 'resource_missing' || error.message.includes('No such customer')) {
      console.warn("Cliente Stripe não encontrado. Limpando ID inválido do banco.");
      
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: null })
        .eq('id', user.id);
        
      redirect('/planos?error=sessao_expirada');
    }

    console.error("Erro ao criar portal:", error);
    throw error;
  }
}


