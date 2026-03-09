"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu ao mudar de rota
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="navbar">
      <div className="nav-content">
        {/* LOGO - Usando sua classe nav-logo */}
        <Link href="/" className="nav-logo">
          Gerador Solar
        </Link>

        {/* LINKS DESKTOP - Escondidos no mobile */}
        <div className="nav-links hidden md:flex">
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active-link' : ''}`}>Início</Link>
          <Link href="/blog" className={`nav-item ${pathname.includes('/blog') ? 'active-link' : ''}`}>Blog</Link>
          <Link href="/calculadora-solar" className={`nav-item ${pathname === '/calculadora-solar' ? 'active-link' : ''}`}>Calculadora</Link>
          <Link href="/declaracao-posse" className="nav-item-btn">
            Posse de Imóvel
          </Link>
        </div>

        {/* BOTÃO HAMBÚRGUER - Visível apenas no mobile */}
        <button 
          className="md:hidden text-white p-2 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir menu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* MENU MOBILE - Dropdown animado */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#0f172a] ${isOpen ? 'max-h-screen border-t border-gray-700' : 'max-h-0'}`}>
        <div className="flex flex-col p-4 gap-4">
          <Link href="/" className="nav-item py-2 border-b border-gray-800">Início</Link>
          <Link href="/blog" className="nav-item py-2 border-b border-gray-800">Blog</Link>
          <Link href="/calculadora-solar" className="nav-item py-2 border-b border-gray-800">Calculadora Solar</Link>
          <Link href="/declaracao-posse" className="nav-item py-4 text-center bg-green-600 rounded-lg font-bold text-white mt-2">
            Gerar Declaração de Posse
          </Link>
        </div>
      </div>
    </nav>
  );
}