import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DownloadButton from '../components/DownloadButton'
import EmailButton from '../components/EmailButton'

export default async function PropostasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: propostas, error } = await supabase
  .from('propostas')
  .select(`
    *,
    profiles (
      full_name,
      company_name,
      phone
    )
  `)
  .eq('user_id', user.id) // Filtro explícito por segurança
  .order('created_at', { ascending: false });

if (error) {
  console.error("Erro na busca:", error.message);
}

  // Cálculos para o Painel de Estatísticas
  const totalInvestido = propostas?.reduce((acc, p) => acc + Number(p.valor_total), 0) || 0;
  const potenciaTotal = propostas?.reduce((acc, p) => acc + Number(p.potencia_kwp), 0) || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Estruturado */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link href="/" className="group flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2">
              <span className="mr-1 transition-transform group-hover:-translate-x-1">←</span> Dashboard
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Minhas Propostas</h1>
            <p className="text-slate-500 font-medium">Gerenciamento de orçamentos e análises técnicas.</p>
          </div>

          <Link
            href="/proposta/nova"
            className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 gap-2"
          >
            <span className="text-xl">+</span> Nova Proposta Solar
          </Link>
        </header>

        {/* Cards de Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total em Orçamentos</p>
            <p className="text-2xl font-bold text-slate-900">{totalInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacidade Total</p>
            <p className="text-2xl font-bold text-slate-900">{potenciaTotal.toFixed(2)} <span className="text-sm font-medium text-slate-400">kWp</span></p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uso do Plano</p>
              <p className="text-2xl font-bold text-slate-900">{propostas?.length || 0} <span className="text-sm font-medium text-slate-400">/ 10</span></p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-500 flex items-center justify-center text-[10px] font-bold">
               {((propostas?.length || 0) / 10 * 100)}%
            </div>
          </div>
        </div>

        {/* Tabela Estilizada */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Especificações</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Investimento</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {propostas && propostas.length > 0 ? (
                  propostas.map((proposta) => (
                    <tr key={proposta.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{proposta.cliente_name}</span>
                          <span className="text-[10px] font-mono text-slate-300 uppercase"># {proposta.id.split('-')[0]}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{proposta.potencia_kwp} kWp</span>
                              <span className="text-[10px] text-slate-400 font-medium">{new Date(proposta.created_at).toLocaleDateString('pt-BR')}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold">
                          {proposta.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <DownloadButton proposta={proposta} />
                          <EmailButton propostaId={proposta.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum projeto ainda</h3>
                        <p className="text-slate-500 text-sm mb-6">Comece a dimensionar sistemas e gerar propostas profissionais agora mesmo.</p>
                        <Link href="/proposta/nova" className="text-blue-600 font-bold hover:text-blue-700 text-sm">
                          + Criar primeira proposta
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="flex items-center justify-center pb-8">
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Asaweb • Sistema Comercial Solar v2.0</p>
        </footer>
      </div>
    </div>
  )
}