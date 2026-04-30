'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { useFormStatus } from 'react-dom'
import { Zap, Star } from 'lucide-react'

export default function CheckoutButton({ popular, planoNome }: { popular: boolean, planoNome: string }) {
  const { pending } = useFormStatus() // Pega o status de carregamento do formulário pai

  return (
    <button
      type="submit"
      disabled={pending}
      // O evento é disparado no clique
      onClick={() => sendGAEvent({ event: 'initiate_checkout', plan_name: planoNome })}
      className={`group w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
        popular
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-900/20'
          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
      } ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {popular ? <Zap size={18} fill="currentColor" /> : <Star size={18} />}
      {pending ? 'Processando...' : 'Assinar Agora'}
    </button>
  )
}