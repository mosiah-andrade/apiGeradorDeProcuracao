import Link from 'next/link'
import { MailCheck } from 'lucide-react'

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <MailCheck size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verifique seu e-mail</h1>
          <p className="text-slate-500 text-sm">
            Enviamos um link de confirmação para o seu e-mail. 
            Acesse-o para ativar sua conta na <strong>Asaweb</strong>.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/login" 
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}