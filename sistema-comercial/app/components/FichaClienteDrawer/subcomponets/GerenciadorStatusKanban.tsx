import { useState } from 'react';
import { Trash2, Plus, Share2 } from 'lucide-react';
import { KanbanStatus } from '../types';

interface Props {
  statusAtualId: string;
  statusNome: string;
  listaStatus: KanbanStatus[];
  modoEdicao: boolean;
  onChangeStatus: (id: string) => void;
  supabase: any;
  onStatusAtualizado: (novaLista: KanbanStatus[]) => void;
}

export function GerenciadorStatusKanban({ statusAtualId, statusNome, listaStatus, modoEdicao, onChangeStatus, supabase, onStatusAtualizado }: Props) {
  const [novoStatusNome, setNovoStatusNome] = useState('');
  const colunasProtegidas = ['novo lead', 'em negociação', 'proposta enviada', 'análise técnica', 'proposta comercial'];

  const handleCriar = async () => {
    if (!novoStatusNome.trim()) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const novoStatus = {
        user_id: session?.user?.id,
        nome: novoStatusNome,
        ordem: listaStatus.length + 1,
        cor: '#' + Math.floor(Math.random() * 16777215).toString(16),
      };
      const { data, error } = await supabase.from('kanban_status').insert([novoStatus]).select().single();
      if (error) throw error;
      
      onStatusAtualizado([...listaStatus, data]);
      onChangeStatus(data.id);
      setNovoStatusNome('');
    } catch (error) { alert('Erro ao criar status'); }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (colunasProtegidas.includes(nome.toLowerCase().trim())) {
      return alert('Não é possível excluir status padrões.');
    }
    if (!confirm(`Excluir status "${nome}"?`)) return;
    
    try {
      await supabase.from('kanban_status').delete().eq('id', id);
      onStatusAtualizado(listaStatus.filter(st => st.id !== id));
      if (statusAtualId === id) onChangeStatus('');
    } catch (error) { alert('Erro ao excluir'); }
  };
  
  return (
    <div className="space-y-3 border-b border-slate-100 pb-4">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status Atual do Funil</label>
      {!modoEdicao ? (
        <div>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            {statusNome || 'Sem Status'} 
          </span>
          
        </div>
      ) : (
        <div className="space-y-3">
          <select value={statusAtualId} onChange={(e) => onChangeStatus(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">Sem Status Definido</option>
            {listaStatus.map(st => <option key={st.id} value={st.id}>{st.nome}</option>)}
          </select>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {listaStatus.map(st => (
                !colunasProtegidas.includes(st.nome.toLowerCase().trim()) && (
                  <div key={st.id} className="flex items-center gap-1 bg-white border border-slate-200 pl-2 pr-1 py-1 rounded-lg text-xs">
                    <span>{st.nome}</span>
                    <button onClick={() => handleExcluir(st.id, st.nome)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )
              ))}
            </div>
          </div>
          <div className="flex gap-1.5">
            <input type="text" placeholder="Criar outro status..." value={novoStatusNome} onChange={e => setNovoStatusNome(e.target.value)} className="flex-1 px-3 py-1 text-xs border rounded-lg" />
            <button type="button" onClick={handleCriar} className="px-2 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-0.5"><Plus className="w-3 h-3" /> Adicionar</button>
          </div>
        </div>
      )}
    </div>
  );
}