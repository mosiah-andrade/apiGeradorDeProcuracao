'use client';

import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Pronto para Acelerar Seus Processos?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Gere sua procuração em segundos, gratuitamente, e autorize a geração de energia solar em sua residência ou negócio.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="https://asaweb.tech" 
            target="_blank"
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition transform hover:scale-105 inline-block"
          >
            Gerar Minha Primeira Procuração →
          </Link>
          <Link 
            href="https://asaweb.tech" 
            target="_blank"
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition inline-block"
          >
            Saiba Mais
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="text-white/80 text-sm">
            ✓ Sem cadastro obrigatório ✓ 100% Gratuito ✓ Instantâneo ✓ Seguro
          </p>
        </div>
      </div>
    </section>
  );
}
