import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  

  // Se não estiver logado, o middleware já deve tratar, 
  // mas reforçamos aqui para evitar erros de renderização.
  if (!user) {
    redirect('/login')
  }
  const nome = user.user_metadata.full_name


  // Buscar propostas do mês atual
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0,0,0,0);

  const { count: propostasMes } = await supabase
    .from('propostas')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', inicioMes.toISOString())

  const limite = 10
  const totalPropostas = propostasMes || 0
  const porcentagemUso = (totalPropostas / limite) * 100


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Asa<span className="text-blue-600">web</span>
          </h1>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Dashboard</Link>
            <Link href="/proposta" className="text-slate-500 hover:text-slate-900 transition-colors">Propostas</Link>
            <Link href="/clientes" className="text-slate-500 hover:text-slate-900 transition-colors">Clientes</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-none">Olá, {nome.split(' ')[0]}</p>
            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all">
              Sair
            </button>
          </form>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500">Controle de uso do sistema Asaweb</p>
          </div>
          
          {/* Barra de Limite Mensal */}
          <div className="w-64">
            <div className="flex justify-between text-xs mb-1 font-bold">
              <span className="text-slate-600 uppercase">Uso do Plano</span>
              <span className={totalPropostas >= limite ? "text-red-600" : "text-blue-600"}>
                {totalPropostas}/{limite}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${totalPropostas >= limite ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(porcentagemUso, 100)}%` }}
              ></div>
            </div>
          </div>
        </header>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard title="Propostas este mês" value={totalPropostas.toString()} trend={totalPropostas >= limite ? "Limite atingido" : ""} />
          <MetricCard title="Aguardando Aceite" value="5" />
          <MetricCard title="Vendas Fechadas" value="3" trend="+5%" />
          <MetricCard title="Total em Orçamentos" value="R$ 145k" />
        </div>

        {/* Seção de Ação Rápida */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Nova Proposta Técnica</h3>
              <p className="text-slate-500 mb-6">Crie orçamentos detalhados com cálculos de ROI e Payback para seus clientes em poucos minutos.</p>
              {totalPropostas < limite ? (
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
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all border border-white/10">
              Falar com suporte
            </button>
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