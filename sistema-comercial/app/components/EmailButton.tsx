'use client'

import { useState } from 'react'
import { reenviarEmailProposta } from '@/app/auth/actions'
import { toast } from 'sonner'

export default function EmailButton({ propostaId }: { propostaId: string }) {
  const [enviando, setEnviando] = useState(false)

  const handleSend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evita disparar cliques no elemento pai (como a linha da tabela)
    
    toast("Deseja reenviar esta proposta por e-mail?", {
      action: {
        label: 'Enviar',
        onClick: () => reenviarEmailProposta(propostaId) // Sua função de envio aqui
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => console.log('Cancelado')
      },
    });;

    setEnviando(true)
    try {
      const result = await reenviarEmailProposta(propostaId)
      if (result.success) {
        toast.success("E-mail enviado com sucesso!")
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar com o servidor de e-mail.");
    } finally {
      setEnviando(false)
    }
  }

  return (
    <button 
      onClick={handleSend}
      disabled={enviando}
      type="button"
      className="text-slate-400 hover:text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 transition-all disabled:opacity-50 cursor-pointer z-50"
    >
      {enviando ? <span className="animate-pulse">⏳</span> : '📧'}
    </button>
  )
}