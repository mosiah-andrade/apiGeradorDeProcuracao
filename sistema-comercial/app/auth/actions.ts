// app/auth/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/mail'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { gerarPdfProposta } from '@/lib/pdf-generator'
import { resend } from '@/lib/mail'

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

export async function signUp(formData: FormData) {
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
      }
    }
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // 2. EXECUTAR O ENVIO (ANTES DO REDIRECT)
  // Verificamos se o usuário foi criado para disparar o e-mail
  if (data?.user) {
    try {
      await sendWelcomeEmail(email, fullName)
    } catch (e) {
      console.error("Falha ao disparar e-mail de boas-vindas:", e)
      // Não damos redirect de erro aqui para não travar o cadastro 
      // se o e-mail falhar, o usuário já foi criado.
    }
  }

  // 3. REDIRECIONAR APENAS NO FINAL
  redirect('/')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Essa é a página que o usuário cairá depois de clicar no e-mail
    redirectTo: `http://localhost:3000/auth/reset-password/confirm`,
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
    redirect(`/auth/reset-password/confirm?error=${error.message}`);
  }

  // Sucesso! Redireciona para o dashboard já logado
  redirect('/message=Senha atualizada com sucesso');
}

export async function criarProposta(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // 1. Coleta de Dados Básicos e Itens
  const cliente_name = formData.get('cliente') as string
  const cliente_email = formData.get('cliente_email') as string
  const potencia_kwp = Number(formData.get('potencia'))
  const valor_total = Number(formData.get('valor'))
  const itens_config = JSON.parse(formData.get('itens_lista') as string)

  // 2. Coleta de Campos de Viabilidade Técnica (Novos)
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
      // Dados de viabilidade para o PDF
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

