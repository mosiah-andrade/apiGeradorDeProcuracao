'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ClipboardCheck, Plus, Settings, Users } from 'lucide-react';

// Importações dos componentes
import { KanbanColumn } from './components/KanbanColumn';
import { KanbanSkeleton } from './components/KanbanSkeleton';
import { KanbanOrphanColumn } from './components/KanbanOrphanColumn';
import { KanbanConfigPanel } from './components/KanbanConfigPanel';
import { FichaClienteDrawer } from '../components/FichaClienteDrawer/FichaClienteDrawer';
import { ModalGerarPropostaSolar } from '../components/ModalGerarPropostaSolar';
import { NovoClienteModal } from '../components/NovoClienteModal';
import { HomologacaoKanban } from './homologacao/HomologacaoKanban';

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
let criacaoDeStatusPadraoEmAndamento: Promise<void> | null = null;

function normalizarNomeStatus(nome: string) {
  return nome.trim().toLocaleLowerCase('pt-BR');
}

function removerStatusDuplicados(statuses: StatusColuna[]) {
  const statusPorNome = new Map<string, StatusColuna>();
  const idParaStatusPrincipal = new Map<string, string>();

  for (const status of statuses) {
    const chave = normalizarNomeStatus(status.nome);
    const statusPrincipal = statusPorNome.get(chave);

    if (statusPrincipal) {
      idParaStatusPrincipal.set(status.id, statusPrincipal.id);
    } else {
      statusPorNome.set(chave, status);
      idParaStatusPrincipal.set(status.id, status.id);
    }
  }

  return {
    statusUnicos: [...statusPorNome.values()],
    idParaStatusPrincipal,
  };
}

export default function KanbanPage() {
  const supabase = createClient();
  const [abaAtiva, setAbaAtiva] = useState<'comercial' | 'homologacao'>('comercial');
  const [colunas, setColunas] = useState<StatusColuna[]>([]);
  const [clientes, setClientes] = useState<ClienteCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoStatusNome, setNovoStatusNome] = useState('');
  const [mostrarConfig, setMostrarConfig] = useState(false);
  
  const [clienteSelecionadoFichaId, setClienteSelecionadoFichaId] = useState<string | null>(null);
  const [clienteParaProposta, setClienteParaProposta] = useState<any | null>(null);
  const [isNovoClienteModalOpen, setIsNovoClienteModalOpen] = useState(false);
  const [projetoParaAbrirId, setProjetoParaAbrirId] = useState<string | null>(null);

  // Ref para o container horizontal do kanban (usado para auto-scroll durante drag)
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Faz auto-scroll horizontal quando o cursor de drag aproxima-se das bordas do container
  function handleBoardDragOver(e: React.DragEvent<HTMLDivElement>) {
    // Evita comportamento padrão e permite drop
    e.preventDefault();

    const el = boardRef.current;
    if (!el) return;

    // Só ativa para drag de cards (ou quando houver dados JSON no dataTransfer)
    try {
      const types = Array.from((e.dataTransfer?.types ?? []) as ArrayLike<unknown>);
      if (types.length > 0 && !types.includes('application/json')) {
        // se não tiver o tipo que usamos, ignora (proteção mínima)
        return;
      }
    } catch (err) {
      // se falhar ao ler types, continua (não bloqueia a rolagem)
    }

    const rect = el.getBoundingClientRect();
    const threshold = 60; // px a partir das bordas para iniciar o scroll
    const scrollStep = 18; // quanto deslocar por evento

    // quando qualquer parte tocar a lateral: avaliamos posição do ponteiro
    if (e.clientX - rect.left < threshold) {
      el.scrollLeft = Math.max(0, el.scrollLeft - scrollStep);
    } else if (rect.right - e.clientX < threshold) {
      el.scrollLeft = el.scrollLeft + scrollStep;
    }
  }

  // === LÓGICA DE DADOS (Restaurada) ===
  async function carregarDadosKanban() {
    setLoading(true);
    try {
      let { data: statusData, error: statusError } = await supabase
        .from('kanban_status')
        .select('*')
        .order('ordem', { ascending: true });

      if (statusError) throw statusError;

      // Evita que duas montagens simultâneas da página criem os status padrão em duplicidade.
      if (!statusData || statusData.length === 0) {
        if (!criacaoDeStatusPadraoEmAndamento) {
          criacaoDeStatusPadraoEmAndamento = (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const colunasPadrao = [
              { user_id: session.user.id, nome: 'Novo Lead', cor: '#3b82f6', ordem: 1 },
              { user_id: session.user.id, nome: 'Em Negociação', cor: '#f59e0b', ordem: 2 },
              { user_id: session.user.id, nome: 'Proposta Enviada', cor: '#547c14', ordem: 3 },
              { user_id: session.user.id, nome: 'Análise Técnica', cor: '#a855f7', ordem: 4 },
            ];
            const { error } = await supabase.from('kanban_status').insert(colunasPadrao);
            if (error && error.code !== '23505') throw error;
          })().finally(() => {
            criacaoDeStatusPadraoEmAndamento = null;
          });
        }

        await criacaoDeStatusPadraoEmAndamento;
        const { data: statusAtualizados, error: statusAtualizadosError } = await supabase
          .from('kanban_status')
          .select('*')
          .order('ordem', { ascending: true });

        if (statusAtualizadosError) throw statusAtualizadosError;
        statusData = statusAtualizados || [];
      }

      const { statusUnicos, idParaStatusPrincipal } = removerStatusDuplicados(statusData || []);
      setColunas(statusUnicos);

      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome, email, telefone, status_id, cidade, estado')
        .order('created_at', { ascending: false });

      if (clientesError) throw clientesError;
      setClientes((clientesData || []).map(cliente => ({
        ...cliente,
        status_id: cliente.status_id ? idParaStatusPrincipal.get(cliente.status_id) || cliente.status_id : null,
      })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDadosKanban();
  }, []);

  useEffect(() => {
    const projetoId = new URLSearchParams(window.location.search).get('projeto');
    if (!projetoId) return;

    setAbaAtiva('homologacao');
    setProjetoParaAbrirId(projetoId);
  }, []);

  async function adicionarColuna(e: React.FormEvent) {
    e.preventDefault();
    if (!novoStatusNome.trim()) return;

    if (colunas.some(coluna => normalizarNomeStatus(coluna.nome) === normalizarNomeStatus(novoStatusNome))) {
      alert('Já existe um status com esse nome.');
      return;
    }

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

  async function criarCardNaColuna(nome: string, statusId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert('Faça login novamente para criar um cartão.');
        return false;
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert({ user_id: session.user.id, nome, status_id: statusId })
        .select('id, nome, email, telefone, status_id, cidade, estado')
        .single();

      if (error) throw error;
      setClientes(clientesAtuais => [data, ...clientesAtuais]);
      return true;
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      alert('Não foi possível criar o cartão. Tente novamente.');
      return false;
    }
  }

 const clientesSemStatus = clientes.filter(c => !c.status_id || !colunas.some(col => col.id === c.status_id));

  // === RENDERIZAÇÃO ===
  if (loading) return <KanbanSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:p-6">
      <div className="mb-6 w-full">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setAbaAtiva('comercial')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              abaAtiva === 'comercial'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Comercial
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('homologacao')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              abaAtiva === 'homologacao'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Homologacao
          </button>
        </div>
      </div>

      {abaAtiva === 'homologacao' ? (
        <HomologacaoKanban projetoParaAbrirId={projetoParaAbrirId} />
      ) : (
        <>
      {/* HEADER DA PÁGINA */}
      <div className="mb-6 flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Funil Kanban Solar</h1>
          <p className="text-sm text-slate-500">Arraste as colunas pelos cabeçalhos para reordenar ou mova os clientes entre elas.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button 
            onClick={() => setMostrarConfig(!mostrarConfig)} 
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-100 sm:flex-none sm:px-4"
          >
            <Settings className="w-4 h-4" /> Customizar Status
          </button>
          <button
            onClick={() => setIsNovoClienteModalOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-amber-600 hover:to-orange-700 sm:flex-none sm:px-4"
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
      <div ref={boardRef} onDragOver={handleBoardDragOver} className="flex w-full snap-x snap-mandatory items-start gap-3 overflow-x-auto pb-4 sm:gap-4">
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
            onCreateCard={criarCardNaColuna}
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
        </>
      )}
    </div>
  );
}
