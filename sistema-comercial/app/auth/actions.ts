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

  // 1. Verificar limite de 10 propostas no mês atual
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('propostas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', inicioMes.toISOString())

  if (count !== null && count >= 10) {
    return { error: "Você atingiu o limite de 10 propostas para este mês." }
  }

  // 2. Criar a proposta no banco e retornar os dados inseridos
  const { data: proposta, error } = await supabase.from('propostas').insert({
    user_id: user.id,
    cliente_name: formData.get('cliente') as string,
    valor_total: Number(formData.get('valor')),
    potencia_kwp: Number(formData.get('potencia')),
  }).select().single()

  if (error || !proposta) return { error: "Erro ao salvar proposta." }

  // 3. Automação de PDF e E-mail (Processamento em Background)
  try {
    const pdfBuffer = await gerarPdfProposta({
      cliente: proposta.cliente_name,
      valor: proposta.valor_total,
      potencia: proposta.potencia_kwp,
      id: proposta.id
    });

    await resend.emails.send({
      from: 'Asaweb <noreply@asaweb.tech>',
      to: user.email!,
      subject: `📄 Proposta Gerada: ${proposta.cliente_name}`,
      html: `<p>A proposta para <strong>${proposta.cliente_name}</strong> foi gerada com sucesso e está em anexo.</p>`,
      attachments: [
        {
          filename: `Proposta_${proposta.cliente_name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  } catch (err) {
    // Logamos o erro mas não bloqueamos o redirect, pois a proposta já está no banco
    console.error("Falha na automação de PDF/E-mail:", err)
  }

  return { success: true };
  revalidatePath('/') 
  redirect('/') 
}