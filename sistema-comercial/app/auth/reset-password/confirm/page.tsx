'use client'

import { updatePassword } from '@/app/auth/actions'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordConfirmPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (error === 'User from sub claim in JWT does not exist') {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
        <p className="font-bold">Link Inválido ou Expirado</p>
        <p className="text-xs">Não encontramos um usuário para este link. Por favor, solicite uma nova senha.</p>
      </div>
    );
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Definir nova senha</h1>
          <p className="text-slate-500 text-sm mb-6">Escolha uma senha forte para proteger seu acesso.</p>
          
          <form action={updatePassword} className="space-y-5">
            <input 
              name="password" 
              type="password" 
              placeholder="Sua nova senha" 
              required 
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
              Atualizar Senha
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}