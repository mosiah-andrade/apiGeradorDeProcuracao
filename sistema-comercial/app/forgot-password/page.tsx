import { resetPassword } from '@/app/auth/actions'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Asa<span className="text-blue-600">web</span>
          </h1>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Recuperar senha</h2>
          <p className="text-slate-500 text-sm mb-6">
            Digite seu e-mail abaixo para receber um link de redefinição.
          </p>

          <form action={resetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail cadastrado</label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Enviar link de recuperação
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold text-sm">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}