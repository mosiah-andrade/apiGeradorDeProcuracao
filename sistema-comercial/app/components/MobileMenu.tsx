"use client";

import { useState } from "react";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function MobileMenu({ isPro }: { isPro: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl z-50">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-bold text-slate-600"
          >
            Dashboard
          </Link>

          <Link
            href="/proposta"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-bold text-slate-600"
          >
            Propostas
          </Link>

          <Link
            href="/planos"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-bold text-slate-600"
          >
            Planos
          </Link>

          {isPro && (
            <div>
              <button
                onClick={() => setIsProOpen(!isProOpen)}
                className="w-full flex items-center justify-between text-sm font-bold text-slate-600"
              >
                Funções Pro
                {isProOpen ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {isProOpen && (
                <div className="mt-3 ml-4 flex flex-col gap-3 border-l-2 border-slate-200 pl-4">
                  <Link
                    href="/clientes"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsProOpen(false);
                    }}
                    className="text-sm text-slate-600"
                  >
                    Clientes
                  </Link>

                  <Link
                    href="/datasheets"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsProOpen(false);
                    }}
                    className="text-sm text-slate-600"
                  >
                    Datasheets
                  </Link>

                  <Link
                    href="/kanban"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsProOpen(false);
                    }}
                    className="text-sm text-slate-600"
                  >
                    Kanban
                  </Link>
                </div>
              )}
            </div>
          )}

          <hr className="border-slate-100" />

          <Link
            href="/perfil"
            onClick={() => setIsMenuOpen(false)}
            className="text-sm font-bold text-slate-600"
          >
            Meu Perfil
          </Link>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm font-bold text-red-600"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}