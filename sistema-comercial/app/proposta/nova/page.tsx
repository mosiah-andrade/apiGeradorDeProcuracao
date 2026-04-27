'use client'

import { criarProposta } from '@/app/auth/actions'
// import { useFormState } from 'react-dom' // Se for Next 14
import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NovaPropostaPage() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(criarProposta, null)

    useEffect(() => {
    if (state?.success) {
      alert("✅ Proposta gerada com sucesso! O PDF foi enviado para o seu e-mail cadastrado.")
      router.push('/') // Redireciona após o usuário fechar o alerta
    }
  }, [state, router])
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Nova Proposta Solar</h1>
          <p className="text-slate-500">Preencha os dados técnicos para gerar o orçamento.</p>
        </header>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form action={formAction} className="space-y-6">
            {state?.success && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <span className="text-xl">📧</span>
                <p className="text-sm font-medium">Proposta enviada para seu e-mail!</p>
              </div>
            )}

            {state?.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-medium">
                {state.error}
              </div>
            )}
            {/* Seção: Cliente */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nome do Cliente
              </label>
              <input
                name="cliente"
                type="text"
                required
                placeholder="Ex: João Silva ou Condomínio Solar"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seção: Potência */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Potência do Sistema (kWp)
                </label>
                <input
                  name="potencia"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 5.4"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Seção: Valor */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Valor Total (R$)
                </label>
                <input
                  name="valor"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 15000.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Seção: Inversor (Opcional, conforme sua pesquisa ASN-3SL) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Modelo do Inversor (Opcional)
              </label>
              <input
                name="inversor"
                type="text"
                placeholder="Ex: ASN-3SL"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400 transition-all"
              />
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-slate-400 max-w-[250px]">
                Ao clicar em gerar, a proposta será salva e descontada do seu limite mensal.
              </p>
              <button
                type="submit"
                disabled={isPending || state?.success}
                className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
                >
                {isPending ? 'Salvando...' : 'Gerar e Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}