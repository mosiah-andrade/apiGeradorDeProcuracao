import Link from 'next/link';
import { Sun, FileText, Zap, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPageVisual() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black text-slate-900 tracking-tighter">
            Asa<span className="text-blue-600">web</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
            <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <Link href="/planos" className="hover:text-blue-600 transition-colors">Preços</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Split: Texto na esquerda, Imagem na direita) */}
      <section className="pt-32 pb-20 px-6 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Feito para Integradores
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Orçamentos solares em <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">minutos, não horas.</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Automatize seus cálculos com dados oficiais da NASA e gere propostas comerciais em PDF de alto impacto. Transmita mais confiança e feche mais projetos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/register" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">
                Criar Conta Gratuita <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          
          {/* Hero Image Mockup */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-cyan-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop" 
              alt="Painéis solares e tecnologia" 
              className="rounded-[3rem] shadow-2xl border-4 border-white object-cover aspect-[4/3] w-full"
            />
            {/* Elemento flutuante na imagem */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Payback Calculado</p>
                  <p className="text-xl font-black text-slate-900">3.2 Anos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 1 (Z-Pattern: Imagem Esquerda, Texto Direita) */}
      <section id="funcionalidades" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
             <div className="absolute inset-0 bg-slate-100 rounded-[3rem] transform -rotate-3 scale-105 -z-10"></div>
             <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop" 
              alt="Dashboard de cálculos" 
              className="rounded-[3rem] shadow-xl border-4 border-white object-cover aspect-square w-full"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Sun size={32} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">Precisão garantida com dados da NASA</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Diga adeus às estimativas imprecisas. O Asaweb puxa as Horas de Sol Pico (HSP) exatas da base de dados climatológica da NASA usando apenas o CEP do seu cliente.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 size={20} className="text-emerald-500" /> Coordenadas exatas por CEP
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 size={20} className="text-emerald-500" /> Cálculo da lei do Fio B atualizado
              </li>
              <li className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 size={20} className="text-emerald-500" /> Dimensionamento inteligente
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURE 2 (Z-Pattern: Texto Esquerda, Imagem Direita) */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <FileText size={32} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">A sua marca em evidência</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Não entregue planilhas feias. Gere propostas comerciais em PDF com design premium, levando o seu logotipo, seus dados de contato e gráficos que o cliente entende.
            </p>
            <p className="text-lg text-slate-500 leading-relaxed">
              Tudo pronto em 1 clique. Baixe ou envie diretamente para o e-mail do seu cliente por dentro da plataforma.
            </p>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-amber-100 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
             <img 
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1000&auto=format&fit=crop" 
              alt="Proposta em PDF" 
              className="rounded-[3rem] shadow-xl border-4 border-white object-cover aspect-square w-full"
            />
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
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Pronto para acelerar suas vendas?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Teste agora mesmo. Oferecemos ferramentas de alto nível para sua engenharia e vendas a partir de R$ 49,90 mensais.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-black hover:bg-blue-500 transition-all shadow-lg active:scale-95">
                Criar Minha Conta Grátis
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">Plano gratuito disponível. Sem cartão de crédito.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 text-center">
        <div className="text-xl font-black text-slate-900 tracking-tighter mb-4">
          Asa<span className="text-blue-600">web</span>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          A inteligência por trás das melhores vendas solares.
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