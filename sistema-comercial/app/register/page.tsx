'use client'

import { signUp } from '@/app/auth/actions'
import Link from 'next/link'
import { useActionState, useState } from 'react'

export default function RegisterPage() {
  // 1. Gerenciamento de estado do formulário e animação
  const [state, formAction, isPending] = useActionState(signUp, null)
  
  // 2. Estados para validação de senha
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')

  // Lógica de comparação
  const senhasCoincidem = senha === confirmacao && senha.length > 0
  const campoConfirmacaoPreenchido = confirmacao.length > 0

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Asa<span className="text-blue-600">web</span>
          </h1>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Crie sua conta gratuita</h2>

          {/* 3. Exibição de Erros da Action (E-mail já cadastrado, etc) */}
          {state?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-top-1">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input
                name="full_name"
                placeholder="Seu nome"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Profissional</label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Campo Senha Principal */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* 4. Campo de Confirmação com Handle Change Visual */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
              <input
                type="password"
                placeholder="Repita sua senha"
                required
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all focus:ring-2 ${
                  campoConfirmacaoPreenchido 
                    ? (senhasCoincidem ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500') 
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
              />
              {campoConfirmacaoPreenchido && (
                <p className={`text-[10px] mt-1 font-bold uppercase ${senhasCoincidem ? 'text-green-600' : 'text-red-600'}`}>
                  {senhasCoincidem ? '✓ As senhas coincidem' : '✕ As senhas estão diferentes'}
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isPending || (campoConfirmacaoPreenchido && !senhasCoincidem)}
              className={`w-full font-semibold py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] ${
                isPending || (campoConfirmacaoPreenchido && !senhasCoincidem)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              {isPending ? 'Criando conta...' : 'Criar minha conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-600 text-sm">
            Já tem conta? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">Entrar</Link>
          </p>
        </div>
      </div>
    </main>
  )
}