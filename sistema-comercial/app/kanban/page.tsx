'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Settings } from 'lucide-react';

// Importações dos componentes
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanSkeleton } from '../components/KanbanSkeleton';
import { KanbanOrphanColumn } from '../components/KanbanOrphanColumn';
import { KanbanConfigPanel } from '../components/KanbanConfigPanel';
import { FichaClienteDrawer } from '../components/FichaClienteDrawer/FichaClienteDrawer';
import { ModalGerarPropostaSolar } from '../components/ModalGerarPropostaSolar';
import { NovoClienteModal } from '../components/NovoClienteModal';

interface StatusColuna {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  user_id?: string | null;
}

interface ClienteCard {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  status_id: string | null;
  cidade: string | null;
  estado: string | null;
}

const colunasProtegidas = ['novo lead', 'em negociação', 'proposta enviada', 'análise técnica', 'proposta comercial'];

export default function KanbanPage() {
  const supabase = createClient();
  const [colunas, setColunas] = useState<StatusColuna[]>([]);
  const [clientes, setClientes] = useState<ClienteCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoStatusNome, setNovoStatusNome] = useState('');
  const [mostrarConfig, setMostrarConfig] = useState(false);
  
  const [clienteSelecionadoFichaId, setClienteSelecionadoFichaId] = useState<string | null>(null);
  const [clienteParaProposta, setClienteParaProposta] = useState<any | null>(null);
  const [isNovoClienteModalOpen, setIsNovoClienteModalOpen] = useState(false);

  // === LÓGICA DE DADOS (Restaurada) ===
  async function carregarDadosKanban() {
    setLoading(true);
    try {
      let { data: statusData, error: statusError } = await supabase
        .from('kanban_status')
        .select('*')
        .order('ordem', { ascending: true });

      if (statusError) throw statusError;

      // Cria colunas padrão se não existir nenhuma
      if (!statusData || statusData.length === 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const colunasPadrao = [
            { user_id: session.user.id, nome: 'Novo Lead', cor: '#3b82f6', ordem: 1 },
            { user_id: session.user.id, nome: 'Em Negociação', cor: '#f59e0b', ordem: 2 },
            { user_id: session.user.id, nome: 'Proposta Enviada', cor: '#547c14', ordem: 3 },
            { user_id: session.user.id, nome: 'Análise Técnica', cor: '#a855f7', ordem: 4 }
          ];
          const { data: novasColunas } = await supabase.from('kanban_status').insert(colunasPadrao).select();
          statusData = novasColunas || [];
        }
      }

      setColunas(statusData || []);

      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome, email, telefone, status_id, cidade, estado');

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDadosKanban();
  }, []);

  async function adicionarColuna(e: React.FormEvent) {
    e.preventDefault();
    if (!novoStatusNome.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase.from('kanban_status').insert([
        {
          user_id: session.user.id,
          nome: novoStatusNome,
          ordem: colunas.length + 1,
          cor: '#' + Math.floor(Math.random() * 16777215).toString(16)
        }
      ]);

      if (error) throw error;
      setNovoStatusNome('');
      carregarDadosKanban();
    } catch (error) {
      console.error(error);
    }
  }

  async function excluirColunaCustomizada(id: string, nome: string) {
    if (colunasProtegidas.includes(nome.toLowerCase().trim())) {
      alert('Ação Bloqueada: Não é permitido excluir os status padrões do funil.');
      return;
    }

    const confirmar = confirm(`Tem certeza que deseja excluir o status "${nome}"? Os clientes vinculados serão movidos automaticamente para a coluna "Sem Status".`);
    if (!confirmar) return;

    try {
      const { error } = await supabase
        .from('kanban_status')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('Coluna removida com sucesso!');
      carregarDadosKanban();
    } catch (error) {
      console.error(error);
      alert('Erro ao remover a coluna.');
    }
  }

  // === NOVOS HANDLERS DE DRAG AND DROP ===
  const handleColunaDrop = async (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;

    // Atualização otimista da UI
    const novasColunas = [...colunas];
    const [colunaRemovida] = novasColunas.splice(sourceIndex, 1);
    novasColunas.splice(targetIndex, 0, colunaRemovida);

    const colunasFormatadas = novasColunas.map((col, idx) => ({
      ...col,
      ordem: idx + 1
    }));

    setColunas(colunasFormatadas);

    try {
      await supabase
        .from('kanban_status')
        .upsert(colunasFormatadas.map(c => ({ id: c.id, ordem: c.ordem, user_id: c.user_id, nome: c.nome, cor: c.cor })));
    } catch (error) {
      console.error(error);
      carregarDadosKanban(); // Reverte em caso de falha
    }
  };

  const handleCardDrop = async (clienteId: string, targetStatusId: string | null) => {
    // Atualização otimista da UI para feedback instantâneo
    setClientes(clientesAtuais => 
      clientesAtuais.map(c => c.id === clienteId ? { ...c, status_id: targetStatusId } : c)
    );

    try {
      const { error } = await supabase
        .from('clientes')
        .update({ status_id: targetStatusId })
        .eq('id', clienteId);

      if (error) throw error;
    } catch (error) {
      console.error(error);
      carregarDadosKanban(); // Reverte em caso de falha
    }
  };

 const clientesSemStatus = clientes.filter(c => !c.status_id || !colunas.some(col => col.id === c.status_id));

  // === RENDERIZAÇÃO ===
  if (loading) return <KanbanSkeleton />;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Funil Kanban Solar</h1>
          <p className="text-sm text-slate-500">Arraste as colunas pelos cabeçalhos para reordenar ou mova os clientes entre elas.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setMostrarConfig(!mostrarConfig)} 
            className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4" /> Customizar Status
          </button>
          <button
            onClick={() => setIsNovoClienteModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>
      </div>

      {mostrarConfig && (
        <KanbanConfigPanel 
          novoStatusNome={novoStatusNome}
          setNovoStatusNome={setNovoStatusNome}
          adicionarColuna={adicionarColuna} // Certifique-se de que a função existe
          colunas={colunas}
          colunasProtegidas={colunasProtegidas}
          excluirColunaCustomizada={excluirColunaCustomizada} // Certifique-se de que a função existe
        />
      )}

      {/* ÁREA DO KANBAN */}
      <div className="flex gap-4 overflow-x-auto pb-4 max-w-7xl mx-auto items-start">
        {colunas.map((coluna, index) => (
          <KanbanColumn
            key={coluna.id}
            coluna={coluna}
            index={index}
            clientes={clientes.filter(c => c.status_id === coluna.id)}
            onColumnDrop={handleColunaDrop} // Certifique-se de que a função existe
            onCardDrop={handleCardDrop} // Certifique-se de que a função existe
            onCardClick={setClienteSelecionadoFichaId}
            onPropostaClick={setClienteParaProposta}
          />
        ))}

        <KanbanOrphanColumn 
          clientes={clientesSemStatus} 
          onCardDrop={handleCardDrop} // Certifique-se de que a função existe
          onCardClick={setClienteSelecionadoFichaId} 
        />
      </div>

      {/* MODAIS */}
      <FichaClienteDrawer 
        clienteId={clienteSelecionadoFichaId} 
        onClose={() => setClienteSelecionadoFichaId(null)} 
        onClienteAtualizado={carregarDadosKanban} // Certifique-se de que a função existe
      />
      <ModalGerarPropostaSolar 
        cliente={clienteParaProposta} 
        onClose={() => setClienteParaProposta(null)} 
        onSuccess={carregarDadosKanban} 
      />
      <NovoClienteModal
        isOpen={isNovoClienteModalOpen}
        onClose={() => setIsNovoClienteModalOpen(false)}
        onSuccess={carregarDadosKanban} 
      />
    </div>
  );
}