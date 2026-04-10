import React from 'react';

const ConteudoSite = () => {
  // Array com os links das logos das concessionárias retiradas da internet
  const logos = [
    { nome: 'Neoenergia', url: 'https://www.neoenergia.com/documents/107590/0/logo.svg/1192324a-0eec-3a97-3a68-900bf72197cc?version=1.0&t=1684246314344' },
    { nome: 'Equatorial', url: 'https://logodownload.org/wp-content/uploads/2021/03/equatorial-logo-2048x513.png' },
    { nome: 'Cemig', url: 'https://logodownload.org/wp-content/uploads/2014/07/cemig-logo-2048x515.png' },
    { nome: 'Enel', url: 'https://logodownload.org/wp-content/uploads/2017/08/enel-logo-1.png' },
    { nome: 'CPFL', url: 'https://logodownload.org/wp-content/uploads/2014/07/cpfl-energia-logo-1-2048x1502.png' },
    { nome: 'Copel', url: 'https://logodownload.org/wp-content/uploads/2017/08/copel-logo-2.png' },
    {nome: 'EDP', url: 'https://logodownload.org/wp-content/uploads/2017/08/edp-logo-1.png' },
    {nome: 'Light', url: 'https://logodownload.org/wp-content/uploads/2014/07/light-logo-2048x768.png' },
    {nome: 'RGE', url: 'https://www.rge-rs.com.br/sites/rge-rs/files/2022-01/RGE%20colorido_no_extra_space.png' },
  ];

  return (
    <>
      {/* Estilo CSS embutido para a animação infinita funcionar sem precisar mexer nas configs do Tailwind */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* Move exatamente metade da largura total */
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
          width: max-content; /* Isso é crucial! Força o container a não se espremer */
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* LETREIRO DE CONCESSIONÁRIAS */}
      <div className="w-full bg-gray-50 border-y border-gray-200 overflow-hidden py-6 mb-8 flex">
        <div className="flex animate-scroll items-center">
          {/* Multiplicamos a lista por 4 para garantir que nunca falte imagem em telas grandes */}
          {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
            <div 
              key={index} 
              // w-48 e flex-shrink-0 garantem que cada bloco tenha a mesma largura e nunca amasse
              className="w-40 sm:w-48 md:w-56 flex-shrink-0 flex justify-center px-4"
            >
              <img 
                src={logo.url} 
                alt={`Logo ${logo.nome}`} 
                className="h-10 md:h-12 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-10 text-gray-700">
        
        {/* Introdução e Proposta de Valor */}
        <article className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Sobre o Asaweb: Software Gerador de Documentos para Energia Solar
          </h2>
          <p className="text-lg leading-relaxed">
            O <strong>Asaweb</strong> foi desenvolvido exclusivamente para agilizar e automatizar o processo de homologação de sistemas fotovoltaicos. 
            Sabemos que o preenchimento manual de documentos técnicos para concessionárias — como <strong>Neoenergia, Equatorial, Cemig e Enel</strong> — é uma tarefa repetitiva que consome horas preciosas do integrador e está frequentemente sujeita a erros que geram reprovações nos projetos.
          </p>
        </article>

        {/* Explicação Técnica (SEO para palavras-chave de topo de funil) */}
        <article className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Por que a Procuração e a Declaração de Posse são essenciais?
          </h2>
          <p className="leading-relaxed">
            No contexto da <strong>Energia Solar (Geração Distribuída)</strong>, a documentação legal correta é o primeiro passo para o sucesso da instalação:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Procuração para Homologação Solar:</strong> É o documento obrigatório onde o cliente (Outorgante) autoriza o engenheiro ou a empresa integradora (Outorgado) a representá-lo junto à concessionária de energia. Ela permite solicitar o acesso, aprovar o projeto, pedir vistoria e solicitar a troca do medidor bidirecional sem a presença física do cliente.
            </li>
            <li>
              <strong>Declaração de Posse:</strong> Frequentemente exigida quando o cliente não possui a escritura definitiva do imóvel. É vital para comprovar o vínculo do titular com o local de instalação do sistema fotovoltaico.
            </li>
          </ul>
        </article>

        {/* Vantagens (Bullets fáceis de ler) */}
        <article className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Vantagens para Integradores Solares</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">📑 Padronização ANEEL</h3>
              <p className="text-sm">Modelos constantemente atualizados de acordo com as normas da ANEEL e exigências específicas das distribuidoras regionais.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">⚡ Agilidade Extrema</h3>
              <p className="text-sm">Abandone o Word manual. Gere documentos precisos em formato .docx ou PDF, prontos para assinatura, em menos de 1 minuto.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">🔒 Privacidade e Segurança</h3>
              <p className="text-sm">Processamento seguro na nossa API dedicada. As informações sensíveis dos seus clientes são utilizadas apenas no momento da montagem do arquivo.</p>
            </div>
          </div>
        </article>

        {/* FAQ Otimizado para "Pessoas também perguntam" do Google */}
        <article className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Dúvidas Frequentes sobre Homologação</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800">O documento gerado atende Pessoa Física (PF) e Jurídica (PJ)?</h3>
              <p className="mt-1 text-gray-600">Sim. O sistema Asaweb adapta automaticamente as cláusulas e o cabeçalho do documento com base na seleção de CPF ou CNPJ no formulário inicial.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800">A Neoenergia e outras concessionárias aceitam este modelo?</h3>
              <p className="mt-1 text-gray-600">Sim. Nossos modelos de procuração e declaração foram criados e validados com base nas exigências do grupo Neoenergia (Celpe, Coelba, Cosern) e demais grandes distribuidoras. Recomendamos apenas a revisão final antes da coleta da assinatura.</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800">Posso editar o arquivo após o download?</h3>
              <p className="mt-1 text-gray-600">Com certeza. O arquivo final é entregue em formato Microsoft Word (.docx), permitindo total liberdade para inserir a logo da sua empresa, adicionar cláusulas extras ou fazer ajustes finos.</p>
            </div>
          </div>
        </article>

        {/* Concessionárias (Tags) */}
        <article className="space-y-4 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900">Concessionárias Compatíveis</h2>
          <p className="text-sm mb-4">A plataforma Asaweb gera documentação adaptável para as principais redes de distribuição do Brasil:</p>
          
          <ul className="flex flex-wrap gap-2 tags-list">
            <li className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Neoenergia (Celpe / PE)</li>
            <li className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Neoenergia (Coelba / BA)</li>
            <li className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Neoenergia (Cosern / RN)</li>
            <li className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Equatorial Energia</li>
            <li className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Cemig</li>
            <li className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Enel</li>
          </ul>
        </article>

      </section>
    
    </>
  );
};

export default ConteudoSite;