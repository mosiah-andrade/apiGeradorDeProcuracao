import { checkoutAction } from '@/app/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Check, Zap, Star } from 'lucide-react'; // Instale lucide-react ou use emojis

const planos = [
  {
    id: 'price_1TRZyhKYK4FcLMhy5b9t6UcE',
    nome: 'Plano Mensal',
    preco: '49,90',
    descricao: 'Ideal para profissionais que estão começando.',
    recursos: ['Propostas Ilimitadas', 'Suporte via Chat', 'Logo Customizada'],
    popular: false,
  },
  {
    id: 'price_1TRZz8KYK4FcLMhymOzWqQvC',
    nome: 'Plano Anual',
    preco: '41,58', // Preço médio (499 / 12) para ancoragem
    precoTotal: '499,00',
    descricao: 'Economize 17% e tenha recursos exclusivos.',
    recursos: ['Tudo do Mensal', '2 meses de bônus', 'Exportação em Massa', 'Prioridade em novos recursos'],
    popular: true,
  }
];

export default async function PlanosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: activeSub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  const isPro = !!activeSub;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Acelere suas <span className="text-blue-600">vendas solar</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para o seu momento e comece a fechar negócios com propostas profissionais.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {planos.map((plano) => (
            <div 
              key={plano.id} 
              className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-300 ${
                plano.popular 
                ? 'bg-slate-900 text-white shadow-2xl shadow-blue-200 ring-4 ring-blue-600/20' 
                : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
              }`}
            >
              {plano.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                  Mais Popular
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">{plano.nome}</h2>
                <p className={`text-sm ${plano.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plano.descricao}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold">R$</span>
                  <span className="text-5xl font-black tracking-tight">{plano.preco}</span>
                  <span className={`text-sm ${plano.popular ? 'text-slate-400' : 'text-slate-500'}`}>/mês</span>
                </div>
                {plano.precoTotal && (
                  <p className="text-blue-400 text-xs font-bold mt-2 italic">
                    Faturado R$ {plano.precoTotal} anualmente
                  </p>
                )}
              </div>

              <ul className="flex-1 space-y-4 mb-10">
                {plano.recursos.map((r) => (
                  <li key={r} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plano.popular ? 'bg-blue-600' : 'bg-blue-100'}`}>
                      <Check size={12} className={plano.popular ? 'text-white' : 'text-blue-600'} />
                    </div>
                    <span className={`text-sm font-medium ${plano.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                      {r}
                    </span>
                  </li>
                ))}
              </ul>

              {isPro ? (
                <div className="w-full py-4 bg-slate-100/10 border border-slate-700/50 text-slate-400 rounded-2xl font-bold text-center text-sm">
                   Assinatura Ativa
                </div>
              ) : (
                <form action={checkoutAction}>
                  <input type="hidden" name="priceId" value={plano.id} />
                  <button 
                    type="submit" 
                    className={`group w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      plano.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-900/20' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
                    }`}
                  >
                    {plano.popular ? <Zap size={18} fill="currentColor" /> : <Star size={18} />}
                    Assinar Agora
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>

        <p className="text-center mt-12 text-slate-400 text-xs">
          Pagamento processado de forma segura pelo <strong>Stripe</strong>. <br className="md:hidden" /> 
          Cancele ou mude de plano a qualquer momento no seu perfil.
        </p>
      </div>
    </div>
  );
}