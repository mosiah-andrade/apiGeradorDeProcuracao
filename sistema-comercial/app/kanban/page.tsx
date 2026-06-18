'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Settings, User, Mail, Phone, Calculator, Move } from 'lucide-react';
import { FichaClienteDrawer } from '../components/FichaClienteDrawer';
import { ModalGerarPropostaSolar } from '../components/ModalGerarPropostaSolar';
import { NovoClienteModal } from '../components/NovoClienteModal';

interface StatusColuna {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
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

export default function KanbanPage() {
  const supabase = createClient();
  const [colunas, setColunas] = useState<StatusColuna[]>([]);
  const [clientes, setClientes] = useState<ClienteCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoStatusNome, setNovoStatusNome] = useState('');
  const [mostrarConfig, setMostrarConfig] = useState(false);
  
  // Controles de Modais e Painéis Flutuantes
  const [clienteSelecionadoFichaId, setClienteSelecionadoFichaId] = useState<string | null>(null);
  const [clienteParaProposta, setClienteParaProposta] = useState<any | null>(null);
  const [isNovoClienteModalOpen, setIsNovoClienteModalOpen] = useState(false);

  // Lista padronizada de colunas blindadas contra exclusão
  const colunasProtegidas = ['novo lead', 'em negociação', 'proposta enviada', 'análise técnica', 'proposta comercial'];

  async function carregarDadosKanban() {
    setLoading(true);
    try {
      let { data: statusData, error: statusError } = await supabase
        .from('kanban_status')
        .select('*')
        .order('ordem', { ascending: true });

      if (statusError) throw statusError;

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

  // Validação forçando minúsculas para evitar falhas de case-sensitivity
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

  const handleColunaDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('colunaIndex', index.toString());
  };

  const handleColunaDrop = async (e: React.DragEvent, targetIndex: number) => {
    const sourceIndexStr = e.dataTransfer.getData('colunaIndex');
    if (!sourceIndexStr) return;

    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (sourceIndex === targetIndex) return;

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
      carregarDadosKanban();
    }
  };

  const handleCardDragStart = (e: React.DragEvent, clienteId: string) => {
    e.dataTransfer.setData('clienteId', clienteId);
  };

  const handleCardDrop = async (e: React.DragEvent, targetStatusId: string | null) => {
    e.preventDefault();
    const clienteId = e.dataTransfer.getData('clienteId');
    if (!clienteId) return;

    const clientesAtualizados = clientes.map(c => 
      c.id === clienteId ? { ...c, status_id: targetStatusId } : c
    );
    setClientes(clientesAtualizados);

    try {
      const { error } = await supabase
        .from('clientes')
        .update({ status_id: targetStatusId })
        .eq('id', clienteId);

      if (error) throw error;
    } catch (error) {
      console.error(error);
      carregarDadosKanban();
    }
  };

  const clientesSemStatus = clientes.filter(c => !c.status_id || !colunas.some(col => col.id === c.status_id));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
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
        <div className="bg-white border border-slate-200 p-5 rounded-2xl max-w-7xl mx-auto mb-6 shadow-sm animate-fade-in space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Criar Novo Status Personalizado</h3>
            <form onSubmit={adicionarColuna} className="flex gap-3 max-w-md">
              <input 
                type="text" 
                placeholder="Ex: Pós-Venda, Visita Técnica..." 
                value={novoStatusNome}
                onChange={(e) => setNovoStatusNome(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Colunas Customizadas (Clique no ✕ para excluir):</span>
            <div className="flex flex-wrap gap-2">
              {colunas.map((col) => {
                // Checagem case-insensitive para proteger contra falhas de digitação ou capitalização
                const ehProtegido = colunasProtegidas.includes(col.nome.toLowerCase().trim());
                if (ehProtegido) return null;

                return (
                  <div key={col.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.cor }} />
                    <span>{col.nome}</span>
                    <button
                      type="button"
                      onClick={() => excluirColunaCustomizada(col.id, col.nome)}
                      className="text-slate-300 hover:text-red-500 transition-colors pl-1 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              {colunas.filter(c => !colunasProtegidas.includes(c.nome.toLowerCase().trim())).length === 0 && (
                <span className="text-xs text-slate-400 italic">Nenhuma coluna extra criada ainda.</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 max-w-7xl mx-auto items-start">
        {colunas.map((coluna, index) => {
          const clientesNaColuna = clientes.filter(c => c.status_id === coluna.id);
          // Agora identifica "Proposta Comercial" ou "Proposta Enviada" de forma dinâmica por conter "proposta"
          const ehColunaProposta = coluna.nome.toLowerCase().includes('proposta');

          return (
            <div 
              key={coluna.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                if (e.dataTransfer.types.includes('colunaindex')) {
                  handleColunaDrop(e, index);
                } else {
                  handleCardDrop(e, coluna.id);
                }
              }}
              className="bg-slate-100/70 border border-slate-200/60 rounded-2xl p-4 w-80 shrink-0 min-h-[550px] transition-all"
            >
              <div 
                draggable
                onDragStart={(e) => handleColunaDragStart(e, index)}
                className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing bg-slate-200/40 p-2 rounded-xl border border-transparent hover:border-slate-200 group/header"
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  <Move className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/header:opacity-100 transition-opacity shrink-0" />
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: coluna.cor }} />
                  <h2 className="font-bold text-slate-800 text-sm truncate max-w-[160px]">{coluna.nome}</h2>
                </div>
                <span className="bg-slate-200/80 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 font-mono shrink-0">
                  {clientesNaColuna.length}
                </span>
              </div>

              <div className="space-y-3">
                {clientesNaColuna.map((cliente) => (
                  <div
                    key={cliente.id}
                    draggable
                    onDragStart={(e) => handleCardDragStart(e, cliente.id)}
                    onClick={() => setClienteSelecionadoFichaId(cliente.id)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-amber-500 transition-colors" />
                        <h4 className="font-medium text-slate-800 text-sm line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {cliente.nome}
                        </h4>
                      </div>
                      <div className="space-y-1 text-xs text-slate-500 pl-6 mb-1">
                        {cliente.email && <div className="truncate">{cliente.email}</div>}
                        {cliente.telefone && <div>{cliente.telefone}</div>}
                      </div>
                    </div>

                    {ehColunaProposta && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setClienteParaProposta(cliente);
                        }}
                        className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        Dimensionar Proposta
                      </button>
                    )}
                  </div>
                ))}

                {clientesNaColuna.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                    Solte registros aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* COLUNA EXTRA DINÂMICA PARA CLIENTES ÓRFÃOS */}
        {clientesSemStatus.length > 0 && (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleCardDrop(e, null)}
            className="bg-red-50/50 border border-dashed border-red-200 rounded-2xl p-4 w-80 shrink-0 min-h-[550px]"
          >
            <div className="flex justify-between items-center mb-4 p-2 bg-red-100/60 rounded-xl">
              <div className="flex items-center gap-2 truncate">
                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                <h2 className="font-bold text-red-800 text-sm truncate">Sem Status</h2>
              </div>
              <span className="bg-red-200 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
                {clientesSemStatus.length}
              </span>
            </div>

            <div className="space-y-3">
              {clientesSemStatus.map((cliente) => (
                <div
                  key={cliente.id}
                  draggable
                  onDragStart={(e) => handleCardDragStart(e, cliente.id)}
                  onClick={() => setClienteSelecionadoFichaId(cliente.id)}
                  className="bg-white p-4 rounded-xl border border-red-100 shadow-sm cursor-pointer hover:border-red-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <User className="w-4 h-4 text-red-400 mt-0.5 group-hover:text-amber-500 transition-colors" />
                      <h4 className="font-medium text-slate-800 text-sm line-clamp-1">
                        {cliente.nome}
                      </h4>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500 pl-6 mb-1">
                      {cliente.email && <div className="truncate">{cliente.email}</div>}
                      {cliente.telefone && <div>{cliente.telefone}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FichaClienteDrawer 
        clienteId={clienteSelecionadoFichaId} 
        onClose={() => setClienteSelecionadoFichaId(null)} 
        onClienteAtualizado={carregarDadosKanban}
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