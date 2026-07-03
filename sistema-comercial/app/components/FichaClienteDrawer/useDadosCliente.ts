import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ClienteData, KanbanStatus, Proposta } from './types';

export function useDadosCliente(clienteId: string | null, onAtualizado?: () => void, onClose?: () => void) {
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  
  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [listaStatus, setListaStatus] = useState<KanbanStatus[]>([]);

  useEffect(() => {
    if (!clienteId) return;
    
    async function carregarFicha() {
      setLoading(true);
      try {
        const { data: statusData } = await supabase.from('kanban_status').select('*').order('ordem');
        if (statusData) setListaStatus(statusData);

        const { data: clientData } = await supabase
          .from('clientes')
          .select('*, kanban_status(nome)')
          .eq('id', clienteId)
          .single();
        
        if (clientData) {
          setCliente(clientData);
          const { data: propData } = await supabase
            .from('propostas')
            .select('*')
            .eq('cliente_name', clientData.nome)
            .order('created_at', { ascending: false });
          
          if (propData) setPropostas(propData);
        }
      } catch (error) {
        console.error('Erro ao carregar ficha:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarFicha();
  }, [clienteId]);

  const handleChangeCliente = (campo: keyof ClienteData, valor: string) => {
    if (cliente) setCliente({ ...cliente, [campo]: valor });
  };

  const salvarCliente = async () => {
    if (!cliente?.nome.trim()) return;
    startTransition(async () => {
      try {
        const { id, kanban_status, ...dadosAtualizacao } = cliente;
        const { error } = await supabase.from('clientes').update(dadosAtualizacao).eq('id', clienteId);
        if (error) throw error;
        if (onAtualizado) onAtualizado();
      } catch (error: any) {
        alert('Erro ao atualizar: ' + error.message);
      }
    });
  };

  const excluirCliente = async () => {
    if (!confirm(`⚠️ ATENÇÃO: Deseja realmente excluir o cliente "${cliente?.nome}"?`)) return;
    startTransition(async () => {
      try {
        const { error } = await supabase.from('clientes').delete().eq('id', clienteId);
        if (error) throw error;
        alert('Cliente removido com sucesso!');
        if (onAtualizado) onAtualizado();
        if (onClose) onClose();
      } catch (error: any) {
        alert('Erro ao excluir: ' + error.message);
      }
    });
  };

  return { 
    cliente, handleChangeCliente, salvarCliente, excluirCliente, 
    propostas, setPropostas, 
    listaStatus, setListaStatus, 
    loading, isPending, supabase 
  };
}