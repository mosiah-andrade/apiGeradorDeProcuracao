import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ContadorPropostas from '@/app/components/ContadorPropostas'

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. DECLARAÇÃO ÚNICA: Definimos o tempo logo no início
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const { data: subscription, error } = await supabase
  .from('subscriptions')
  .select('status')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .maybeSingle(); // Retorna o objeto ou null se não existir

// 2. Define a variável isPro de forma segura
// Se houver dados (subscription não é null), isPro será true
const isPro = !!subscription; 


  // 3. BUSCA CONTAGEM DE PROPOSTAS (Usando a variável única inicioMes)
  const { count: propostasNoMes } = await supabase
    .from('propostas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', inicioMes.toISOString());

  // 4. DEFINIÇÃO DE LIMITES
  const limite = 10;
  const totalPropostas = propostasNoMes || 0;


  return (
    <div className="min-h-screen bg-slate-50">

      {/* Conteúdo Principal */}
      <main className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500">Controle de uso do sistema Asaweb</p>
          </div>
          
          {/* Barra de Limite Mensal */}
          <ContadorPropostas isPro={isPro} count={propostasNoMes || 0}  />
        </header>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard title="Propostas este mês" value={totalPropostas.toString()} trend={totalPropostas >= limite && !isPro ? "Limite atingido" : ""} />
          {/* <MetricCard title="Aguardando Aceite" value="5" />
          <MetricCard title="Vendas Fechadas" value="3" trend="+5%" />
          <MetricCard title="Total em Orçamentos" value="R$ 145k" /> */}
        </div>

        {/* Seção de Ação Rápida */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Nova Proposta Técnica</h3>
              <p className="text-slate-500 mb-6">Crie orçamentos detalhados com cálculos de ROI e Payback para seus clientes em poucos minutos.</p>
              {totalPropostas < limite || isPro ? (
                <Link 
                  href="/proposta/nova" 
                  className="inline-flex bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all"
                >
                  + Gerar Proposta
                </Link>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
                  ⚠️ Você atingiu seu limite mensal de 10 propostas. <strong>Faça upgrade para o Plano Pro</strong> para continuar gerando orçamentos ilimitados.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Suporte Asaweb</h3>
            <p className="text-slate-400 text-sm mb-6">Dúvidas sobre cálculos de dimensionamento ou integração com o Supabase?</p>
            <a 
              href="https://wa.me/558189289155" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all border border-white/10 text-center"
            >
              Falar com suporte
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

// Subcomponente para os cards (pode mover para /components depois)
function MetricCard({ title, value, trend }: { title: string, value: string, trend?: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-slate-500 text-xs font-bold uppercase mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {trend && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{trend}</span>}
      </div>
    </div>
  )
}