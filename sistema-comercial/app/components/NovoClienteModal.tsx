'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Zap } from 'lucide-react';

interface NovoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoClienteModal({ isOpen, onClose, onSuccess }: NovoClienteModalProps) {
    const supabase = createClient();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [documento, setDocumento] = useState('');
  const [concessionaria, setConcessionaria] = useState('');
  const [codigoUc, setCodigoUc] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Usuário não autenticado.');

      const { error } = await supabase.from('clientes').insert([
        {
          user_id: session.user.id,
          nome,
          email: email || null,
          telefone: telefone || null,
          documento: documento || null,
          concessionaria: concessionaria || null,
          codigo_uc: codigoUc || null,
          cidade: cidade || null,
          estado: estado || null,
        },
      ]);

      if (error) throw error;

      // Limpar formulário
      setNome(''); setEmail(''); setTelefone(''); setDocumento('');
      setConcessionaria(''); setCodigoUc(''); setCidade(''); setEstado('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
        // Captura as propriedades específicas do erro do Supabase ou do JavaScript
        const errorMsg = error?.message || 'Erro desconhecido';
        const errorDetails = error?.details || '';
        const errorHint = error?.hint || '';

        console.error('--- DETALHES DO ERRO ---');
        console.error('Mensagem:', errorMsg);
        if (errorDetails) console.error('Detalhes:', errorDetails);
        if (errorHint) console.error('Dica:', errorHint);
        console.error('Objeto completo:', JSON.stringify(error));
        console.error('------------------------');

        alert(`Erro ao salvar o cliente solar: ${errorMsg}`);
        } finally {
        setSubmitting(false);
        }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-semibold text-slate-800">Novo Cliente Solar</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Nome / Razão Social *</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">CPF / CNPJ</label>
              <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Telefone</label>
              <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Dados de Energia Elétrica</span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Concessionária</label>
                <input type="text" value={concessionaria} onChange={(e) => setConcessionaria(e.target.value)} placeholder="Ex: Neoenergia, Cemig" className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Código da UC / Instalação</label>
                <input type="text" value={codigoUc} onChange={(e) => setCodigoUc(e.target.value)} placeholder="Nº da Conta de Luz" className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Cidade</label>
              <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Estado</label>
              <input type="text" maxLength={2} value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-center text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-sm">{submitting ? 'Salvando...' : 'Salvar Cliente'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}