import Link from 'next/link';

export default function TermosPage() {
  return (
    <main className=" mx-auto p-8 py-20 bg-slate-50 min-h-screen">
      
      
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-slate-500 mb-10">Última atualização: Abril de 2026</p>
        
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma Asaweb.tech, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Descrição do Serviço</h2>
            <p>
              O Asaweb.tech é uma plataforma B2B (Software as a Service) desenvolvida para auxiliar integradores solares. Nossas ferramentas incluem calculadoras de irradiação solar, dimensionamento de sistemas fotovoltaicos, geração de propostas comerciais e elaboração de documentos técnicos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Limitação de Responsabilidade</h2>
            <p>
              <strong>Atenção:</strong> O Asaweb.tech atua como uma ferramenta de apoio ao integrador. As estimativas de geração de energia, cálculos de irradiação e projeções financeiras (payback) são baseadas em APIs públicas (como a da NASA) e algoritmos matemáticos padronizados.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>A plataforma <strong>não substitui</strong> a validação técnica de um engenheiro eletricista responsável.</li>
              <li>Não nos responsabilizamos pela aprovação ou reprovação de projetos junto a concessionárias de energia.</li>
              <li>Não garantimos o fechamento de vendas ou a exatidão financeira das propostas geradas, sendo responsabilidade do usuário a conferência dos dados antes do envio ao cliente final.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Assinaturas e Pagamentos</h2>
            <p>
              O acesso aos recursos premium da plataforma é cobrado de forma recorrente (mensal ou anual). O processamento de pagamentos é realizado de forma segura através do Stripe. O usuário pode cancelar sua assinatura a qualquer momento através do painel de controle, sem multas, mantendo o acesso até o fim do ciclo já pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Propriedade Intelectual</h2>
            <p>
              O código-fonte, design, logotipos e algoritmos da plataforma Asaweb.tech são de propriedade exclusiva de seus desenvolvedores. É terminantemente proibida a cópia, engenharia reversa ou revenda não autorizada dos nossos serviços.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}