import React, { useState } from 'react';

// Definição dos possíveis status do cliente no funil
export type StatusCliente = 'lead' | 'analise_tecnica' | 'proposta_comercial' | 'ganho' | 'perdido';

interface Cliente {
  id: string;
  nome: string;
  empresa?: string;
  telefone: string;
  status: StatusCliente;
  consumoMensalKwh?: number;
}

interface CardClienteProps {
  cliente: Cliente;
  onGerarProposta: (clienteId: string, dadosProposta: string) => void;
}

export const CardCliente: React.FC<CardClienteProps> = ({ cliente, onGerarProposta }) => {
  const [detalhesProposta, setDetalhesProposta] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmeterProposta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalhesProposta.trim()) return;

    setCarregando(true);
    // Simula ou chama a função que gera o PDF/proposta via API ou Supabase
    await onGerarProposta(cliente.id, detalhesProposta);
    setCarregando(false);
    setDetalhesProposta('');
  };

  // Badge de status com cores dinâmicas
  const getStatusBadge = (status: StatusCliente) => {
    const config = {
      lead: 'bg-blue-100 text-blue-800',
      analise_tecnica: 'bg-purple-100 text-purple-800',
      proposta_comercial: 'bg-amber-100 text-amber-800 font-semibold animate-pulse',
      ganho: 'bg-green-100 text-green-800',
      perdido: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden max-w-md w-full p-6 transition-all hover:shadow-lg">
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{cliente.nome}</h3>
          {cliente.empresa && (
            <p className="text-sm text-slate-500">{cliente.empresa}</p>
          )}
        </div>
        {getStatusBadge(cliente.status)}
      </div>

      {/* Informações de Contato / Técnicas */}
      <div className="text-sm text-slate-600 space-y-1 mb-6">
        <p><strong>Telefone:</strong> {cliente.telefone}</p>
        {cliente.consumoMensalKwh && (
          <p><strong>Consumo Mensal:</strong> {cliente.consumoMensalKwh} kWh</p>
        )}
      </div>

      {/* Renderização Condicional: Só exibe se o status for exatamente 'proposta_comercial' */}
      {cliente.status === 'proposta_comercial' ? (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 bg-amber-50/50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-1">
            <span>📄</span> Preparar Proposta Comercial
          </h4>
          
          <form onSubmit={handleSubmeterProposta} className="space-y-3">
            <div>
              <label htmlFor="dados-proposta" className="block text-xs font-medium text-slate-700 mb-1">
                Observações ou Descontos da Proposta:
              </label>
              <textarea
                id="dados-proposta"
                rows={3}
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder="Ex: Inserir desconto de 5% à vista ou kit específico de inversores..."
                value={detalhesProposta}
                onChange={(e) => setDetalhesProposta(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm py-2 px-4 rounded-md transition-colors shadow-sm disabled:opacity-50"
            >
              {carregando ? 'Gerando Documento...' : 'Gerar e Enviar Proposta'}
            </button>
          </form>
        </div>
      ) : (
        /* Feedback visual opcional quando não está no status correto */
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 italic">
            Avance o cliente para o status de Proposta para liberar a geração comercial.
          </p>
        </div>
      )}
    </div>
  );
};