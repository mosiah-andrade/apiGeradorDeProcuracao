import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <main className=" mx-auto p-8 py-20 bg-slate-50 min-h-screen">
      
      
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-slate-500 mb-10">Última atualização: Abril de 2026</p>
        
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Nosso Compromisso</h2>
            <p>
              A sua privacidade é importante para nós. O Asaweb.tech respeita a sua privacidade em relação a qualquer informação sua que possamos coletar em nosso site e sistema, em total conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Dados que Coletamos</h2>
            <p>Solicitamos informações pessoais apenas quando estritamente necessário para fornecer o serviço. Coletamos:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Dados de Conta:</strong> Nome, e-mail e senha (armazenada de forma criptografada via Supabase).</li>
              <li><strong>Dados de Perfil:</strong> Nome da sua empresa, telefone e logotipo para personalização das propostas geradas (whitelabel).</li>
              <li><strong>Dados de Uso:</strong> Informações sobre as propostas geradas, para contabilização de limites do plano e funcionamento do sistema.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Informações Financeiras</h2>
            <p>
              O Asaweb.tech <strong>não armazena nem processa</strong> diretamente os dados do seu cartão de crédito. Todas as transações financeiras são gerenciadas pelo Stripe, um dos maiores e mais seguros gateways de pagamento do mundo, obedecendo aos mais rígidos padrões de segurança (PCI Compliance).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Compartilhamento de Dados</h2>
            <p>
              Não compartilhamos suas informações de identificação pessoal publicamente ou com terceiros, exceto nos casos em que a lei exija ou com parceiros de infraestrutura estritamente necessários para operar o software (como provedores de banco de dados e envio de e-mails, todos compatíveis com normas de proteção de dados).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Retenção e Exclusão</h2>
            <p>
              Você é livre para recusar a nossa solicitação de informações pessoais, ciente de que talvez não possamos fornecer alguns dos serviços desejados. Você pode, a qualquer momento, solicitar a exclusão permanente da sua conta e de todos os dados atrelados a ela entrando em contato conosco.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}