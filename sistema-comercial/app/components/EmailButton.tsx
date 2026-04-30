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
        onClick: async () => {
          // Toda a lógica de envio vem para DENTRO do onClick
          setEnviando(true);
          try {
            const result = await reenviarEmailProposta(propostaId);
            if (result.success) {
              toast.success("E-mail enviado com sucesso!");
            }
          } catch (error) {
            console.error(error);
            toast.error("Erro ao conectar com o servidor de e-mail.");
          } finally {
            setEnviando(false);
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => console.log('Envio cancelado pelo usuário')
      },
    });

  }

  return (
    <button 
      onClick={handleSend}
      disabled={enviando}
      type="button"
      className="text-blue-400 hover:text-blue-600 p-2 rounded-lg bg-blue-50 hover:bg-blue-200 transition-all flex-col  cursor-pointer z-50 "
    >
      {enviando ? <span className="animate-pulse">⏳</span> : '📧'}
      <p className="text-sm font-medium">{enviando ? 'Enviando...' : 'Reenviar'}</p>
    </button>
  )
}