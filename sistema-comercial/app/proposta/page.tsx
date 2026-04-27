import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PropostasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Buscar todas as propostas do usuário logado
  const { data: propostas, error } = await supabase
    .from('propostas')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Minhas Propostas</h1>
            <p className="text-slate-500 text-sm">Histórico completo de orçamentos gerados.</p>
          </div>

          <Link
            href="/proposta/nova"
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-center"
          >
            + Nova Proposta
          </Link>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Potência</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propostas && propostas.length > 0 ? (
                propostas.map((proposta) => (
                  <tr key={proposta.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{proposta.cliente_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{proposta.id.split('-')[0]}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {proposta.potencia_kwp} <span className="text-xs text-slate-400 font-normal">kWp</span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-bold">
                      {proposta.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(proposta.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all">
                        {/* Ícone de Visualizar (pode usar Heroicons ou Lucide) */}
                        📄
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl grayscale">☀️</span>
                      <p className="text-slate-500 font-medium">Nenhuma proposta encontrada.</p>
                      <Link href="/proposta/nova" className="text-blue-600 hover:underline text-sm">
                        Comece gerando sua primeira proposta comercial.
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumo de Uso do Plano no Rodapé */}
        <div className="mt-6 flex justify-end">
          <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Uso Mensal:</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {propostas?.length || 0} / 10
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}