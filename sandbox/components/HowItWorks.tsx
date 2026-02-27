'use client';

import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Adicione seus Dados',
      description: 'Preencha seu CPF e informações básicas. Leva menos de 1 minuto.'
    },
    {
      number: '2',
      title: 'Selecione a Concessionária',
      description: 'Escolha entre as 28 concessionárias de energia do Brasil'
    },
    {
      number: '3',
      title: 'Revise o Documento',
      description: 'Verifique todas as informações antes de gerar o PDF'
    },
    {
      number: '4',
      title: 'Download Instantâneo',
      description: 'Baixe a procuração pronta para assinar e enviar'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Como funciona em <span className="text-green-600">4 passos simples</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Processo rápido, seguro e intuitivo
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 -z-10"></div>
              )}

              <div className="bg-white rounded-xl p-8 border border-gray-200 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Pronto para começar?
              </h3>
              <p className="text-gray-600 mb-6">
                Não é mais fácil do que isso. Sem cadastro obrigatório, sem assinaturas, sem complicações. Apenas gere sua procuração e pronto!
              </p>
              <Link 
                href="https://asaweb.tech" 
                target="_blank"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Gerar Procuração Agora
              </Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="font-semibold text-gray-900">Documento em PDF</p>
                    <p className="text-sm text-gray-600">Pronto para assinar e compartilhar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✍️</span>
                  <div>
                    <p className="font-semibold text-gray-900">Assinatura Digital</p>
                    <p className="text-sm text-gray-600">Opcional para mais segurança</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📤</span>
                  <div>
                    <p className="font-semibold text-gray-900">Envio à Concessionária</p>
                    <p className="text-sm text-gray-600">Você controla tudo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
