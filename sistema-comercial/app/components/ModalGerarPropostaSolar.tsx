'use client';

import { useState, useTransition } from 'react';
import { X, Calculator, Plus, Trash2 } from 'lucide-react';
import AnaliseTecnica from '../proposta/nova/AnaliseTecnica';
import { criarProposta } from '@/app/auth/actions';

interface ItemProposta {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

interface ModalGerarPropostaSolarProps {
  cliente: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalGerarPropostaSolar({ cliente, onClose, onSuccess }: ModalGerarPropostaSolarProps) {
  const [isPending, startTransition] = useTransition();

  // Estados de controle unificados (iguais aos da página proposta/nova)
  const [consumo, setConsumo] = useState(0);
  const [geracao, setGeracao] = useState(0);
  const [payback, setPayback] = useState(0);
  const [potencia, setPotencia] = useState(0);
  const [clienteEmail, setClienteEmail] = useState(cliente?.email || '');
  const [itens, setItens] = useState<ItemProposta[]>([
    { descricao: 'Kit Solar Fotovoltaico Profissional', quantidade: 1, valorUnitario: 0 }
  ]);

  if (!cliente) return null;

  // Formatadores de moeda (BRL) idênticos ao seu NovaPropostaClient
  const formatarMoedaInput = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const parseMoedaParaNumero = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return parseFloat(apenasNumeros) / 100;
  };

  // Preenche automaticamente o Kit com base no cálculo da NASA feito pelo subcomponente
  const handleCalculoFinalizado = (dados: any) => {
    setConsumo(dados.calculo.consumo);
    setGeracao(Math.round(dados.calculo.geracaoMensalMedia));
    setPayback(Number(dados.calculo.paybackAnos.toFixed(1)));
    setPotencia(Number(dados.calculo.potenciaSistema.toFixed(2)));
    
    const novosItens = [...itens];
    novosItens[0].valorUnitario = dados.calculo.custoEstimado;
    setItens(novosItens);
  };

  const valorTotalCalculado = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  // Dispara a Server Action preenchendo o FormData exatamente com as chaves esperadas
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('cliente', cliente.nome);
    formData.append('cliente_email', clienteEmail);
    formData.append('potencia', potencia.toString());
    formData.append('valor', valorTotalCalculado.toString());
    formData.append('itens_lista', JSON.stringify(itens));
    formData.append('consumo_mensal', consumo.toString());
    formData.append('geracao_estimada', geracao.toString());
    formData.append('payback_anos', payback.toString());

    startTransition(async () => {
      try {
        const response = await criarProposta(null, formData);
        if (response?.error) {
          alert(response.error);
        } else {
          alert(`Proposta comercial enviada com sucesso para ${cliente.nome}!`);
          onSuccess();
          onClose();
        }
      } catch (err) {
        console.error(err);
        alert('Erro de comunicação com o servidor ao gerar proposta.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Calculator className="text-blue-600 w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-900">Gerador de Proposta: {cliente.nome}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Área Escrupulosa de Formulários */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-[#f8fafc]">
          
          {/* Passo 1: Injeta a sua calculadora oficial da NASA (CEP, Consumo, Potência Painel, Qtd Manual) */}
          <AnaliseTecnica onCalcular={handleCalculoFinalizado} />

          {/* Passo 2: Finalização Comercial Completa */}
          <form onSubmit={handleSubmitFinal} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
            
            {/* E-mail de Envio Dinâmico */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail para envio da Proposta</label>
              <input 
                type="email"
                placeholder="cliente@email.com"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-sm"
              />
            </div>

            {/* Composição Dinâmica dos Itens do Kit (Renderização Idêntica ao PDF) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Composição do Kit</h3>
                  <p className="text-xs text-slate-400">Detalhamento dos itens que constarão no relatório e PDF comercial.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setItens([...itens, { descricao: '', quantidade: 1, valorUnitario: 0 }])}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold transition-all active:scale-95"
                >
                  + Novo Item
                </button>
              </div>

              <div className="space-y-3">
                {itens.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 items-center hover:bg-white hover:border-blue-200 transition-all">
                    <div className="col-span-12 md:col-span-6">
                      <input 
                        className="w-full bg-transparent border-none p-0 text-sm font-medium text-slate-700 focus:ring-0" 
                        value={item.descricao} 
                        onChange={e => {
                          const next = [...itens]; next[idx].descricao = e.target.value; setItens(next);
                        }} 
                        placeholder="Ex: Módulo Jinko Solar 550W"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 flex items-center border-l border-slate-200 pl-3">
                      <span className="text-[10px] font-bold text-slate-400 mr-2">QTD</span>
                      <input 
                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0" 
                        type="number" 
                        value={item.quantidade} 
                        onChange={e => {
                          const next = [...itens]; next[idx].quantidade = Number(e.target.value); setItens(next);
                        }} 
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3 flex items-center border-l border-slate-200 pl-3">
                      <input 
                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0" 
                        type="text" 
                        value={formatarMoedaInput(item.valorUnitario)} 
                        onChange={e => {
                          const next = [...itens]; 
                          next[idx].valorUnitario = parseMoedaParaNumero(e.target.value); 
                          setItens(next);
                        }} 
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => removerItem(idx)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Display de Métricas Técnicas de Viabilidade */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="md:col-span-3 bg-slate-900 rounded-2xl p-4 text-white grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Potência</p>
                  <p className="text-base font-bold">{potencia} <span className="text-xs font-normal text-slate-500">kWp</span></p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Geração</p>
                  <p className="text-base font-bold">{geracao} <span className="text-xs font-normal text-slate-500">kWh</span></p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Payback</p>
                  <p className="text-base font-bold">{payback} <span className="text-xs font-normal text-slate-500">Anos</span></p>
                </div>
              </div>

              <div className="bg-blue-600 rounded-2xl p-4 text-white flex flex-col justify-center shadow-md shadow-blue-100">
                <p className="text-[10px] uppercase font-bold text-blue-200 mb-0.5">Total Orçado</p>
                <p className="text-base font-black truncate">
                  {valorTotalCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

            {/* Rodapé de Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isPending || potencia === 0}
                className={`px-6 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-md ${
                  isPending || potencia === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5'
                }`}
              >
                {isPending ? 'Gerando PDF e E-mail...' : 'Confirmar e Gerar Proposta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}