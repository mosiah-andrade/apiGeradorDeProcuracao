'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, User, Mail, Phone, MapPin, Zap, Trash2, Edit2, Check, Download, Eye, Plus } from 'lucide-react';

interface FichaClienteDrawerProps {
  clienteId: string | null;
  onClose: () => void;
  onClienteAtualizado?: () => void;
}

export function FichaClienteDrawer({ clienteId, onClose, onClienteAtualizado }: FichaClienteDrawerProps) {
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [propostas, setPropostas] = useState<any[]>([]);
  const [listaStatus, setListaStatus] = useState<any[]>([]);

  const [loadingAcaoId, setLoadingAcaoId] = useState<string | null>(null);

  // Estados dos campos editáveis do cliente
  const [modoEdicao, setModoEdicao] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [documento, setDocumento] = useState('');
  const [concessionaria, setConcessionaria] = useState('');
  const [codigoUc, setCodigoUc] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [statusId, setStatusId] = useState('');
  const [statusNome, setStatusNome] = useState('');

  const [novoStatusNome, setNovoStatusNome] = useState('');

  const colunasProtegidas = ['novo lead', 'em negociação', 'proposta enviada', 'análise técnica', 'proposta comercial'];

  async function carregarFicha() {
    if (!clienteId) return;
    setLoading(true);
    try {
      const { data: statusData } = await supabase
        .from('kanban_status')
        .select('*')
        .order('ordem', { ascending: true });
      setListaStatus(statusData || []);

      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select('*, kanban_status(nome)')
        .eq('id', clienteId)
        .single();
      
      if (clientError) throw clientError;

      if (clientData) {
        setNome(clientData.nome || '');
        setEmail(clientData.email || '');
        setTelefone(clientData.telefone || '');
        setDocumento(clientData.documento || '');
        setConcessionaria(clientData.concessionaria || '');
        setCodigoUc(clientData.codigo_uc || '');
        setCidade(clientData.cidade || '');
        setEstado(clientData.estado || '');
        setStatusId(clientData.status_id || '');
        setStatusNome(clientData.kanban_status?.nome || 'Sem Status');

        const { data: propData } = await supabase
          .from('propostas')
          .select('*')
          .eq('cliente_name', clientData.nome)
          .order('created_at', { ascending: false });
        
        setPropostas(propData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar ficha:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (clienteId) {
      setModoEdicao(false);
      setNovoStatusNome('');
      carregarFicha();
    }
  }, [clienteId]);

  const handleSalvarAlteracoes = async () => {
    if (!nome.trim()) return;
    startTransition(async () => {
      try {
        const { error } = await supabase
          .from('clientes')
          .update({
            nome,
            email: email || null,
            telefone: telefone || null,
            documento: documento || null,
            concessionaria: concessionaria || null,
            codigo_uc: codigoUc || null,
            cidade: cidade || null,
            estado: estado || null,
            status_id: statusId || null,
          })
          .eq('id', clienteId);

        if (error) throw error;
        setModoEdicao(false);
        if (onClienteAtualizado) onClienteAtualizado();
        carregarFicha();
      } catch (error: any) {
        alert('Erro ao atualizar: ' + error.message);
      }
    });
  };

  // --- AÇÃO EXCLUSIVA: EXCLUIR CLIENTE INTEGRADO ---
  const handleExcluirCliente = async () => {
    const confirmar = confirm(`⚠️ ATENÇÃO: Deseja realmente excluir o cliente "${nome}"? Esta ação removerá permanentemente o cadastro e todo o histórico de propostas comerciais dele.`);
    if (!confirmar) return;

    startTransition(async () => {
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', clienteId);

        if (error) throw error;

        alert('Cliente solar removido com sucesso do sistema!');
        if (onClienteAtualizado) onClienteAtualizado(); // Recarrega os dados do Kanban em tempo real
        onClose(); // Fecha o Drawer lateral imediatamente
      } catch (error: any) {
        alert('Erro ao tentar excluir o registro: ' + error.message);
      }
    });
  };

  const handleCriarNovoStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoStatusNome.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: novoStatus, error } = await supabase
        .from('kanban_status')
        .insert([
          {
            user_id: session.user.id,
            nome: novoStatusNome,
            ordem: listaStatus.length + 1,
            cor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      alert(`Status "${novoStatusNome}" criado com sucesso!`);
      setListaStatus([...listaStatus, novoStatus]);
      setStatusId(novoStatus.id);
      setNovoStatusNome('');
      if (onClienteAtualizado) onClienteAtualizado();
    } catch (error: any) {
      alert('Erro ao criar status: ' + error.message);
    }
  };

  const handleExcluirStatus = async (idStatusParaDeletar: string, nomeStatus: string) => {
    if (colunasProtegidas.includes(nomeStatus.toLowerCase().trim())) {
      alert('Ação bloqueada: Não é possível excluir os status padrões.');
      return;
    }

    const confirmar = confirm(`Deseja excluir o status "${nomeStatus}"?`);
    if (!confirmar) return;

    try {
      const { error } = await supabase.from('kanban_status').delete().eq('id', idStatusParaDeletar);
      if (error) throw error;
      alert('Status removido!');
      if (statusId === idStatusParaDeletar) setStatusId('');
      setListaStatus(listaStatus.filter(st => st.id !== idStatusParaDeletar));
      if (onClienteAtualizado) onClienteAtualizado();
    } catch (error: any) {
      alert('Erro ao excluir status: ' + error.message);
    }
  };

  // --- MÉTODOS DE PROPOSTA ---
  const handleBaixarPDF = async (proposta: any) => {
    setLoadingAcaoId(`${proposta.id}-download`);
    try {
      const { gerarPdfProposta } = await import('@/lib/pdf-generator');
      const doc = await gerarPdfProposta({
        id: proposta.id,
        cliente: proposta.cliente_name,
        potencia: proposta.potencia_kwp,
        valor: proposta.valor_total,
        itens: proposta.itens_config || [],
        consumo_mensal: proposta.consumo_mensal,
        geracao_estimada: proposta.geracao_estimada,
        payback_anos: proposta.payback_anos
      });
      doc.save(`Proposta_Solar_${proposta.cliente_name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) { alert('Erro ao baixar o PDF.'); } 
    finally { setLoadingAcaoId(null); }
  };

  const handlePreviewPDF = async (proposta: any) => {
    setLoadingAcaoId(`${proposta.id}-preview`);
    try {
      const { gerarPdfProposta } = await import('@/lib/pdf-generator');
      const doc = await gerarPdfProposta({
        id: proposta.id,
        cliente: proposta.cliente_name,
        potencia: proposta.potencia_kwp,
        valor: proposta.valor_total,
        itens: proposta.itens_config || [],
        consumo_mensal: proposta.consumo_mensal,
        geracao_estimada: proposta.geracao_estimada,
        payback_anos: proposta.payback_anos
      });
      window.open(doc.output('bloburl'), '_blank');
    } catch (error) { alert('Erro na visualização.'); }
    finally { setLoadingAcaoId(null); }
  };

  const handleReenviarEmail = async (proposta: any) => {
    if (!proposta.cliente_email) return alert('Cliente sem e-mail.');
    setLoadingAcaoId(`${proposta.id}-email`);
    try {
      await fetch('/api/proposta/reenviar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propostaId: proposta.id }) });
      alert('E-mail enviado!');
    } catch (error) { alert('Erro no e-mail.'); }
    finally { setLoadingAcaoId(null); }
  };

  const handleExcluirProposta = async (propostaId: string) => {
    if (!confirm('Excluir proposta?')) return;
    try {
      await supabase.from('propostas').delete().eq('id', propostaId);
      setPropostas(propostas.filter(p => p.id !== propostaId));
    } catch (error) { alert('Erro ao deletar.'); }
  };

  if (!clienteId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-in">
      {/* Cabeçalho do Drawer */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <User className="text-amber-500 w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-800">Ficha do Cliente Solar</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (modoEdicao ? handleSalvarAlteracoes() : setModoEdicao(true))}
            disabled={isPending}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              modoEdicao ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {modoEdicao ? <><Check className="w-3.5 h-3.5" /> Salvar</> : <><Edit2 className="w-3.5 h-3.5" /> Editar</>}
          </button>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-3 border-b border-slate-100 pb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status Atual do Funil</label>
                {!modoEdicao ? (
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {statusNome}
                  </span>
                ) : (
                  <div className="space-y-3">
                    <select
                      value={statusId}
                      onChange={(e) => setStatusId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">Sem Status Definido</option>
                      {listaStatus.map((st) => (
                        <option key={st.id} value={st.id}>{st.nome}</option>
                      ))}
                    </select>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 block">Excluir colunas customizadas:</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {listaStatus.map((st) => {
                          const ehProtegido = colunasProtegidas.includes(st.nome.toLowerCase().trim());
                          if (ehProtegido) return null;
                          return (
                            <div key={st.id} className="flex items-center gap-1 bg-white border border-slate-200 pl-2 pr-1 py-1 rounded-lg text-xs font-medium text-slate-700">
                              <span>{st.nome}</span>
                              <button type="button" onClick={() => handleExcluirStatus(st.id, st.nome)} className="text-slate-300 hover:text-red-500 p-0.5 rounded"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <input type="text" placeholder="Criar outro status..." value={novoStatusNome} onChange={(e) => setNovoStatusNome(e.target.value)} className="flex-1 px-3 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none" />
                      <button type="button" onClick={handleCriarNovoStatus} className="px-2 py-1 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-0.5"><Plus className="w-3 h-3" /> Adicionar</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Cliente</label>
                <input type="text" disabled={!modoEdicao} value={nome} onChange={(e) => setNome(e.target.value)} className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-semibold disabled:bg-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail</label>
                  <input type="email" disabled={!modoEdicao} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-1.5 border border-slate-200 text-sm disabled:bg-transparent" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Telefone</label>
                  <input type="text" disabled={!modoEdicao} value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full mt-1 px-3 py-1.5 border border-slate-200 text-sm disabled:bg-transparent" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cidade</label>
                  <input type="text" disabled={!modoEdicao} value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full mt-1 px-3 py-1.5 border border-slate-200 text-sm disabled:bg-transparent" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Estado</label>
                  <input type="text" maxLength={2} disabled={!modoEdicao} value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} className="w-full mt-1 px-3 py-1.5 border border-slate-200 text-sm text-center disabled:bg-transparent" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Concessionária</label>
                <input type="text" disabled={!modoEdicao} value={concessionaria} onChange={(e) => setConcessionaria(e.target.value)} className="w-full mt-1 px-3 py-1.5 border border-slate-200 text-sm disabled:bg-transparent" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Código UC</label>
                <input type="text" disabled={!modoEdicao} value={codigoUc} onChange={(e) => setCodigoUc(e.target.value)} className="w-full mt-1 px-3 py-1.5 border border-slate-200 text-sm font-mono disabled:bg-transparent" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Histórico de Propostas</h4>
              {propostas.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-dashed">Nenhuma proposta gerada.</p>
              ) : (
                <div className="space-y-3">
                  {propostas.map((prop) => (
                    <div key={prop.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-all">
                      <div>
                        <div className="text-base font-black text-slate-900">{prop.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{prop.potencia_kwp} kWp • {new Date(prop.created_at).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div className="flex items-center gap-1 bg-white border border-slate-200/60 rounded-xl p-1 shrink-0">
                        <button onClick={() => handlePreviewPDF(prop)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleBaixarPDF(prop)} className="p-1.5 text-slate-500 hover:text-green-600 rounded-lg"><Download className="w-4 h-4" /></button>
                        <button onClick={() => handleReenviarEmail(prop)} className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg"><Mail className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button onClick={() => handleExcluirProposta(prop.id)} className="p-1.5 text-slate-300 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BOTÃO VISUAL CONDICIONAL: Aparece no rodapé apenas se o modoEdicao for verdadeiro */}
          {modoEdicao && (
            <div className="pt-4 border-t border-slate-100 mt-8">
              <button
                type="button"
                disabled={isPending}
                onClick={handleExcluirCliente}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl py-3 font-semibold text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isPending ? 'Excluindo registro...' : 'Excluir Cliente Permanentemente'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}