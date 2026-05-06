import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Se houver um "next" na URL, redirecionamos para lá, senão vai para a home
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Troca o código pela sessão do usuário
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se algo der errado, manda para uma página de erro ou login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}