import Link from 'next/link';
import { Sun, FileText, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black text-slate-900 tracking-tighter">
            Asa<span className="text-blue-600">web</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
            <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#beneficios" className="hover:text-blue-600 transition-colors">Benefícios</a>
            <Link href="/planos" className="hover:text-blue-600 transition-colors">Preços</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            A Ferramenta Definitiva para Integradores
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
            Venda mais projetos solares com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">propostas irresistíveis.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Dimensione sistemas fotovoltaicos em segundos com dados da NASA e gere propostas comerciais em PDF com a sua marca, cálculo de Payback e ROI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/register" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">
              Começar Gratuitamente
            </Link>
            <a href="#funcionalidades" className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all active:scale-95 text-center">
              Ver como funciona
            </a>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-4">Sem necessidade de cartão de crédito. Teste agora.</p>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Tudo que sua engenharia e vendas precisam</h2>
            <p className="text-slate-500">Automatize o trabalho braçal e foque em fechar negócios.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Sun size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dados Oficiais da NASA</h3>
              <p className="text-slate-500 leading-relaxed">
                Integração direta para buscar as Horas de Sol Pico (HSP) exatas baseadas no CEP do seu cliente. Adeus achismos.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Propostas Whitelabel</h3>
              <p className="text-slate-500 leading-relaxed">
                Gere PDFs elegantes com a sua logo, seus dados de contato e gráficos de geração de energia fáceis de entender.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Estudo de Viabilidade</h3>
              <p className="text-slate-500 leading-relaxed">
                Cálculos instantâneos de Payback, ROI, economia mensal e impacto da taxação do Fio B para quebrar objeções.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Zap size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Pronto para modernizar suas vendas?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Junte-se a integradores que economizam horas de cálculos manuais toda semana. A partir de R$ 49,90/mês para acesso ilimitado.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-black hover:bg-blue-500 transition-all shadow-lg active:scale-95">
                Criar Minha Conta
              </Link>
              <Link href="/planos" className="bg-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all active:scale-95">
                Ver Planos
              </Link>
            </div>
            <ul className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-sm font-medium text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Limite gratuito mensal</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Cancele quando quiser</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Suporte especializado</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 text-center">
        <div className="text-xl font-black text-slate-900 tracking-tighter mb-4">
          Asa<span className="text-blue-600">web</span>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Soluções de engenharia e vendas para o setor solar.
        </p>
        <div className="flex justify-center gap-6 text-sm font-bold text-slate-500 mb-8">
          <Link href="/termos" className="hover:text-blue-600 transition-colors">Termos de Uso</Link>
          <Link href="/privacidade" className="hover:text-blue-600 transition-colors">Privacidade</Link>
        </div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Asaweb Tech. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
