'use client'

import Link from 'next/link'

interface ContadorProps {
  isPro: boolean
  count: number
  limit?: number
}

export default function ContadorPropostas({ isPro, count, limit = 10 }: ContadorProps) {
  // Se for PRO, mostramos apenas o selo distintivo
  if (isPro) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso Mensal</p>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        PLANO PRO ATIVO
      </div>
    )
  }

  const porcentagem = Math.min((count / limit) * 100, 100)
  const isCritico = count >= limit * 0.8 // Fica vermelho em 80% do uso

  return (
    <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="hidden sm:block text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso Mensal</p>
        <p className="text-sm font-black text-slate-700">
          {count} <span className="text-slate-300 font-medium">/ {limit}</span>
        </p>
      </div>

      <div className="relative w-20 h-2 bg-slate-100 rounded-full overflow-hidden hidden md:block">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${
            isCritico ? 'bg-red-500' : 'bg-blue-600'
          }`}
          style={{ width: `${porcentagem}%` }}
        />
      </div>

      <Link 
        href="/planos" 
        className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 text-[10px] font-black rounded-xl uppercase transition-all hover:scale-105 active:scale-95 shadow-sm shadow-amber-200"
      >
        Upgrade
      </Link>
    </div>
  )
}