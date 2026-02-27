'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">☀️</span>
              </div>
              <span className="font-bold text-xl">ProcuraSolar</span>
            </div>
            <p className="text-gray-400 text-sm">
              Gerador gratuito de procuração para energia solar, suportando todas as concessionárias do Brasil.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="#features" className="hover:text-white transition">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="https://asaweb.tech" target="_blank" className="hover:text-white transition">
                  Concessionárias
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="https://asaweb.tech" target="_blank" className="hover:text-white transition">
                  Sobre ProcuraSolar
                </Link>
              </li>
              <li>
                <Link href="https://asaweb.tech" target="_blank" className="hover:text-white transition">
                  Suporte
                </Link>
              </li>
              <li>
                <Link href="https://asaweb.tech" target="_blank" className="hover:text-white transition">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="https://asaweb.tech/politica-de-privacidade" target="_blank" className="hover:text-white transition">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="https://asaweb.tech" target="_blank" className="hover:text-white transition">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; 2026 ProcuraSolar. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="https://asaweb.tech" target="_blank" className="text-gray-400 hover:text-white transition">
              <span className="text-xl">🌐</span>
            </Link>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-4 gap-4 text-center text-gray-400 text-sm">
            <div>
              <p className="font-semibold text-white">50K+</p>
              <p>Procurações Geradas</p>
            </div>
            <div>
              <p className="font-semibold text-white">100%</p>
              <p>Taxa de Aceitação</p>
            </div>
            <div>
              <p className="font-semibold text-white">28</p>
              <p>Concessionárias</p>
            </div>
            <div>
              <p className="font-semibold text-white">⭐⭐⭐⭐⭐</p>
              <p>4.9 em 5 estrelas</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
