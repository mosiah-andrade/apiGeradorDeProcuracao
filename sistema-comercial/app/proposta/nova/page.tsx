// app/proposta/nova/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server';
import NovaPropostaPage from './NovaPropostaClient'; // O arquivo do seu formulário

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Verifica se é PRO
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user?.id)
    .eq('status', 'active');

  // 2. Conta propostas do mês
  const { count } = await supabase
    .from('propostas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  return (
    <NovaPropostaPage 
      isPro={!!subscription} 
      propostasNoMes={count || 0} 
    />
  );
}