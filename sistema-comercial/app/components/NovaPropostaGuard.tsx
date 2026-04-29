// app/proposta/nova/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NovaPropostaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Chama a função RPC que criamos no banco de dados
  const { data: canCreate } = await supabase.rpc('can_user_create_proposta', { 
    target_user_id: user.id 
  });

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Limite Atingido</h2>
            <p className="text-slate-500 mt-2">
              Você atingiu o limite de 20 propostas gratuitas deste mês.
            </p>
          </div>
          <Link 
            href="/planos" 
            className="block w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
          >
            Seja PRO e tenha Propostas Ilimitadas
          </Link>
          <Link href="/" className="block text-sm text-slate-400 hover:text-slate-600">
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}