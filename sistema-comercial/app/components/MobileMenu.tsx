"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function MobileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl z-50 animate-in slide-in-from-top duration-200">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-600">Dashboard</Link>
          <Link href="/proposta" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-600">Propostas</Link>
          <Link href="/planos" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-600">Planos</Link>
          <hr className="border-slate-100" />
          <Link href="/perfil" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-600">Meu Perfil</Link>
        </div>
      )}
    </div>
  );
}