import { Eye, Download, Mail, Trash2 } from 'lucide-react';
import { Proposta } from '../types';

interface Props {
  propostas: Proposta[];
  supabase: any;
  onDeleteProposta: (id: string) => void;
}

export function HistoricoPropostas({ propostas, supabase, onDeleteProposta }: Props) {
  
  const getConfigPdf = (prop: Proposta) => ({
    id: prop.id, cliente: prop.cliente_name, potencia: prop.potencia_kwp, 
    valor: prop.valor_total, itens: prop.itens_config || [], 
    consumo_mensal: prop.consumo_mensal, geracao_estimada: prop.geracao_estimada, payback_anos: prop.payback_anos
  });

  const handlePreviewPDF = async (prop: Proposta) => {
    const { gerarPdfProposta } = await import('@/lib/pdf-generator');
    const doc = await gerarPdfProposta(getConfigPdf(prop));
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleBaixarPDF = async (prop: Proposta) => {
    const { gerarPdfProposta } = await import('@/lib/pdf-generator');
    const doc = await gerarPdfProposta(getConfigPdf(prop));
    doc.save(`Proposta_Solar_${prop.cliente_name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleReenviarEmail = async (prop: Proposta) => {
    if (!prop.cliente_email) return alert('Cliente sem e-mail.');
    try {
      await fetch('/api/proposta/reenviar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propostaId: prop.id }) });
      alert('E-mail enviado!');
    } catch (error) { alert('Erro no e-mail.'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir proposta?')) return;
    try {
      await supabase.from('propostas').delete().eq('id', id);
      onDeleteProposta(id);
    } catch (error) { alert('Erro ao deletar.'); }
  };

  return (
    <div className="space-y-3 mt-6">
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Histórico de Propostas</h4>
      {propostas.length === 0 ? (
        <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-dashed">Nenhuma proposta gerada.</p>
      ) : (
        <div className="space-y-3">
          {propostas.map((prop) => (
            <div key={prop.id} className="p-4 border rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-base font-black text-slate-900">{prop.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{prop.potencia_kwp} kWp • {new Date(prop.created_at).toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="flex items-center gap-1 bg-white border rounded-xl p-1 shrink-0">
                <button onClick={() => handlePreviewPDF(prop)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                <button onClick={() => handleBaixarPDF(prop)} className="p-1.5 text-slate-500 hover:text-green-600 rounded-lg"><Download className="w-4 h-4" /></button>
                <button onClick={() => handleReenviarEmail(prop)} className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg"><Mail className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button onClick={() => handleDelete(prop.id)} className="p-1.5 text-slate-300 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}