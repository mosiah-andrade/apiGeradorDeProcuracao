'use client';

export default function Features() {
  const features = [
    {
      icon: '⚡',
      title: 'Instantâneo',
      description: 'Gere sua procuração em segundos, sem burocracias ou atrasos'
    },
    {
      icon: '💰',
      title: '100% Gratuito',
      description: 'Sem nenhum custo. Use quantas vezes precisar sem limitações'
    },
    {
      icon: '🔒',
      title: 'Seguro',
      description: 'Seus dados são protegidos com criptografia de nível bancário'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Funciona perfeitamente em qualquer dispositivo, em qualquer lugar'
    },
    {
      icon: '✅',
      title: 'Válido Legalmente',
      description: 'Documento reconhecido por todas as concessionárias do Brasil'
    },
    {
      icon: '🌍',
      title: 'Todas as Concessionárias',
      description: 'Funciona com TODAS as distribuidoras de energia do país'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Por que escolher <span className="text-green-600">ProcuraSolar</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desenvolvido especificamente para facilitar a geração de energia solar no Brasil
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-8 hover:shadow-lg hover:border-green-300 transition"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <p className="text-gray-600">Procurações geradas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">28</div>
              <p className="text-gray-600">Concessionárias suportadas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <p className="text-gray-600">Taxa de aceitação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
