import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-green-50 to-blue-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Procurações para Energia Solar
              <span className="text-green-600"> Instantaneamente</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Gere procurações profissionais em minutos. Compatível com todas as concessionárias do Brasil. Seguro, rápido e 100% gratuito.
            </p>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link 
                href="https://asaweb.tech" 
                target="_blank"
                className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-semibold text-lg text-center"
              >
                Começar Agora →
              </Link>
              <Link 
                href="#features"
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg hover:bg-green-50 transition font-semibold text-lg text-center"
              >
                Saiba Mais
              </Link>
            </div>
          </div>
          <div className="bg-green-100 rounded-xl h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-2xl font-bold text-green-900">Procuração Solar</p>
              <p className="text-green-700">Gerador Inteligente</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
