'use client'

import { criarProposta } from '@/app/auth/actions'
import { useActionState, useState, useEffect } from 'react'
import AnaliseTecnica from './AnaliseTecnica'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ContadorPropostas from '@/app/components/ContadorPropostas'
import { sendGAEvent } from '@next/third-parties/google'

interface ItemProposta {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

interface NovaPropostaProps {
  isPro?: boolean;
  propostasNoMes?: number;
}

export default function NovaPropostaPage({ isPro = false, propostasNoMes = 0 }: NovaPropostaProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(criarProposta, null)
  
  const [consumo, setConsumo] = useState(0)
  const [geracao, setGeracao] = useState(0)
  const [payback, setPayback] = useState(0)
  const [potencia, setPotencia] = useState(0)
  const [itens, setItens] = useState<ItemProposta[]>([
    { descricao: 'Kit Solar Fotovoltaico Profissional', quantidade: 1, valorUnitario: 0 }
  ])

  // Função para formatar o número para exibição no Input (BRL)
  const formatarMoedaInput = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  // Função para converter a string do input de volta para número puro
  const parseMoedaParaNumero = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return parseFloat(apenasNumeros) / 100;
  };

  const handleCalculoFinalizado = (dados: any) => {
    setConsumo(dados.calculo.consumo)
    setGeracao(Math.round(dados.calculo.geracaoMensalMedia))
    setPayback(Number(dados.calculo.paybackAnos.toFixed(1)))
    setPotencia(Number(dados.calculo.potenciaSistema.toFixed(2)))
    
    const novosItens = [...itens]
    novosItens[0].valorUnitario = dados.calculo.custoEstimado
    setItens(novosItens)
  }

  const valorTotalCalculado = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0)

  useEffect(() => {
    if (state?.success){
      sendGAEvent({ event: 'generate_proposal', value: valorTotalCalculado });
       router.push('/')
    }
  }, [state, router, valorTotalCalculado])

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header com Navegação */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> 
            Dashboard
          </Link>
          <ContadorPropostas isPro={isPro} count={propostasNoMes} />
        </div>

        {/* Componente Técnico */}
        <AnaliseTecnica onCalcular={handleCalculoFinalizado} />

        {/* Formulário Principal */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-white border-b border-slate-100 p-6">
            <h1 className="text-xl font-bold text-slate-900">Finalizar Proposta</h1>
            <p className="text-sm text-slate-500">Revise os valores e adicione os dados do cliente para gerar o PDF.</p>
          </div>

          <form action={formAction} className="p-6 space-y-8">
            {/* Inputs ocultos para enviar ao servidor */}
            <input type="hidden" name="itens_lista" value={JSON.stringify(itens)} />
            <input type="hidden" name="valor" value={valorTotalCalculado} />
            <input type="hidden" name="potencia" value={potencia} />
            <input type="hidden" name="consumo_mensal" value={consumo} />
            <input type="hidden" name="geracao_estimada" value={geracao} />
            <input type="hidden" name="payback_anos" value={payback} />

            {/* Dados do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome do Cliente</label>
                <input 
                  name="cliente" 
                  type="text" 
                  required 
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail para envio</label>
                <input 
                  name="cliente_email" 
                  type="email" 
                  placeholder="cliente@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300" 
                />
              </div>
            </div>

            {/* Seção de Itens Dinâmica */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <div>
                  <h3 className="font-bold text-slate-900">Composição do Kit</h3>
                  <p className="text-xs text-slate-400">Detalhamento dos itens que aparecerão no PDF.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setItens([...itens, {descricao: '', quantidade: 1, valorUnitario: 0}])} 
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold transition-all active:scale-95"
                >
                  + Novo Item
                </button>
              </div>

              <div className="space-y-3">
                {itens.map((item, idx) => (
                  <div key={idx} className="group grid grid-cols-12 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
                    <div className="col-span-12 md:col-span-6">
                      <input 
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300" 
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
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700" 
                        type="number" 
                        value={item.quantidade} 
                        onChange={e => {
                          const next = [...itens]; next[idx].quantidade = Number(e.target.value); setItens(next);
                        }} 
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3 flex items-center border-l border-slate-200 pl-3">
                      <input 
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700" 
                        type="text" 
                        value={formatarMoedaInput(item.valorUnitario)} 
                        onChange={e => {
                          const valorNumerico = parseMoedaParaNumero(e.target.value);
                          const next = [...itens]; 
                          next[idx].valorUnitario = valorNumerico; 
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
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo de Viabilidade */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 bg-slate-900 rounded-3xl p-6 text-white grid grid-cols-3 gap-4 relative overflow-hidden">
                <div className="z-10">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Potência</p>
                  <p className="text-xl font-bold">{potencia} <span className="text-xs font-normal text-slate-500">kWp</span></p>
                </div>
                <div className="z-10">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Geração</p>
                  <p className="text-xl font-bold">{geracao} <span className="text-xs font-normal text-slate-500">kWh</span></p>
                </div>
                <div className="z-10">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Payback</p>
                  <p className="text-xl font-bold">{payback} <span className="text-xs font-normal text-slate-500">Anos</span></p>
                </div>
              </div>

              <div className="bg-blue-600 rounded-3xl p-6 text-white flex flex-col justify-center shadow-xl shadow-blue-200">
                <p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Total Orçado</p>
                <p className="text-xl font-black">
                  {valorTotalCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending} 
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${
                isPending 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 shadow-blue-200'
              }`}
            >
              {isPending ? 'Processando...' : 'Gerar Proposta Profissional'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}