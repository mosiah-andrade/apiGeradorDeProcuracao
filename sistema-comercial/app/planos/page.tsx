// app/planos/page.tsx
import { checkoutAction, syncStripeProducts } from '@/app/auth/actions';
import { on } from 'events';

const planos = [
  {
    id: 'price_1TRZyhKYK4FcLMhy5b9t6UcE', // Substitua pelo ID real do seu Stripe Dashboard
    nome: 'Mensal',
    preco: 'R$ 49,90',
    recursos: ['Propostas Ilimitadas', 'Suporte Prioritário', 'Logo Customizada'],
  },
  {
    id: 'price_1TRZz8KYK4FcLMhymOzWqQvC', // Substitua pelo ID real
    nome: 'Anual',
    preco: 'R$ 499,00',
    recursos: ['Tudo do Mensal', '2 meses grátis', 'Exportação em Massa'],
  }
];

export default function PlanosPage() {
    syncStripeProducts() // Sincroniza os produtos do Stripe ao carregar a página (opcional, para desenvolvimento)



  return (
    <div className="py-12 max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Escolha seu Plano</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {planos.map((plano) => (
          <div key={plano.id} className="border rounded-xl p-8 flex flex-col shadow-sm bg-white">
            <h2 className="text-xl font-bold">{plano.nome}</h2>
            <p className="text-4xl font-bold my-4">{plano.preco}<span className="text-sm font-normal">/período</span></p>
            <ul className="flex-1 space-y-3 mb-8">
              {plano.recursos.map((r) => (
                <li key={r} className="flex items-center text-gray-600">
                  <span className="mr-2 text-green-500">✓</span> {r}
                </li>
              ))}
            </ul>
            <form action={checkoutAction}>
              <input type="hidden" name="priceId" value={plano.id} />
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Assinar Agora
              </button>
              
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}