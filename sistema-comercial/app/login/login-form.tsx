'use client'

import { login } from '@/app/auth/actions'
import Link from 'next/link'

export default function LoginForm({ error, message }: { error?: string; message?: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Acesse sua conta</h2>

      <form action={login} className="space-y-5">
        {/* Mensagens de Feedback */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-sm border border-blue-100">
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
          <input
            name="email"
            type="email"
            placeholder="nome@empresa.com"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <Link 
              href="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
        >
          Entrar
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-slate-600 text-sm">
          Não tem uma conta?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold">
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  )
}