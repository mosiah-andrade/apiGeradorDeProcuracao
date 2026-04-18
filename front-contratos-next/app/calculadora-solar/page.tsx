"use client";

import AnaliseTecnica from '@/components/Analise-tecnica';
import React, { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CalculadoraSolarPro() {
  const adRef = useRef<HTMLDivElement>(null);
  const resultadoRef = useRef<HTMLDivElement>(null); // Ref para o scroll
  const [dadosResultado, setDadosResultado] = useState<any>(null);

  // Efeito para Scroll Suave quando o resultado for gerado
  useEffect(() => {
    if (dadosResultado && resultadoRef.current) {
      setTimeout(() => {
        resultadoRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [dadosResultado]);

  // Efeito para carregar Scripts de Ads (Exemplo Adsterra)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && adRef.current) {
          adRef.current.innerHTML = '';
          const script = document.createElement('script');
          script.src = "https://pl28807824.effectivegatecpm.com/6884d9994893fc4e4dc7fcbefa9e2832/invoke.js";
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          adRef.current.appendChild(script);
        }
      } catch (e: any) {
        console.log("Aviso de Ads:", e.message);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen py-6 max-w-7xl m-auto px-4 sm:px-6 ">
      
      {/* HEADER */}
      <header className="mb-12 border-b pb-6 w-full text-center lg:text-left">
        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
          Calculadora Solar <span className="text-blue-600">Pro</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Análise técnica avançada e viabilidade financeira em tempo real.</p>
      </header>

      {/* GRID SUPERIOR: CONTEÚDO E FORMULÁRIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full items-start mb-16">
        
        {/* Lado Esquerdo: Imagem e Texto Informativo */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img 
              src="/calculadoraSolarPro.webp" 
              alt="Energia Solar Pro" 
              className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
            />
          </div>
          <article className="prose prose-slate lg:prose-lg max-w-none">
            <p className="text-slate-700 leading-relaxed text-lg">
              A <strong>Calculadora Solar Pro</strong> utiliza dados geoespaciais da NASA para fornecer a estimativa mais precisa do mercado. 
              Ao inserir seu CEP, processamos a irradiação solar específica da sua região, considerando perdas técnicas (PR) e a nova legislação brasileira de 2026.
            </p>
          </article>
        </div>

        {/* Lado Direito: Formulário de Entrada (Sidebar) */}
        <aside className="flex flex-col gap-8 w-full sticky top-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <AnaliseTecnica onCalcular={setDadosResultado} />
          </div>
          
        </aside>
      </div>

      {/* SEÇÃO DE RESULTADOS: LARGURA TOTAL */}
      {dadosResultado && (
        <section 
          ref={resultadoRef} 
          className="w-full pt-16 border-t border-slate-100 scroll-mt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000"
        >
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Análise de Resultados
            </h2>
            <p className="text-slate-500">Com base no consumo de {dadosResultado.calculo.consumo} kWh/mês</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* CARD 1: DIMENSIONAMENTO */}
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-blue-400 font-bold mb-6 uppercase text-xs tracking-widest">Potência do Sistema</h3>
              <div className="text-6xl font-black mb-2">
                {dadosResultado.calculo.potenciaSistema.toFixed(2)}
                <span className="text-xl ml-2 text-blue-300">kWp</span>
              </div>
              <p className="text-slate-400 text-sm border-l-2 border-blue-500 pl-4 mt-4">
                Instalação sugerida de <strong>{dadosResultado.calculo.qtdPaineis} módulos</strong> de alto desempenho.
              </p>
            </div>

            {/* CARD 2: FINANCEIRO */}
            <div className="bg-green-50 border border-green-100 p-8 rounded-[2.5rem] shadow-lg flex flex-col">
              <h3 className="text-green-800 font-bold mb-6 uppercase text-xs tracking-widest">Viabilidade Econômica</h3>
              
              <div className="text-4xl font-black text-green-700 mb-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosResultado.calculo.custoEstimado)}
              </div>
              <p className="text-green-600/70 text-sm mb-6 uppercase font-bold tracking-tighter">Investimento Estimado</p>

              {/* DETALHAMENTO FIO B E ECONOMIA */}
              <div className="space-y-3 mb-6 border-t border-green-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Economia Mensal Estimada:</span>
                  <span className="font-bold text-green-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosResultado.calculo.economiaMensal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    Encargo Fio B (Lei 14.300):
                    <span className="group relative cursor-help">
                      <span className="text-[10px] bg-slate-200 rounded-full px-1.5 font-bold text-slate-500">?</span>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Valor pago à distribuidora pelo uso da rede na energia injetada. Cálculo para 2026 ({dadosResultado.calculo.percentualFioB}% do Fio B).
                      </span>
                    </span>
                  </span>
                  <span className="font-bold text-red-500">
                    - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosResultado.calculo.custoFioB)}
                  </span>
                </div>
              </div>

              <div className="mt-auto bg-white p-5 rounded-2xl border border-green-200 shadow-sm">
                <span className="text-slate-500 text-xs block mb-1">Retorno do Investimento (Payback):</span>
                <span className="text-3xl font-black text-slate-800">{dadosResultado.calculo.paybackAnos.toFixed(1)} anos</span>
              </div>
            </div>

            {/* CARD 3: TÉCNICO */}
            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] shadow-lg">
              <h3 className="text-blue-800 font-bold mb-6 uppercase text-xs tracking-widest">Dados da Região</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-blue-200 pb-2">
                  <span className="text-slate-600 text-sm font-medium">Radiação Solar (HSP):</span>
                  <span className="text-xl font-bold text-blue-900">{dadosResultado.calculo.hspAnual.toFixed(2)} <small>h/dia</small></span>
                </div>
                <div className="flex justify-between items-end border-b border-blue-200 pb-2">
                  <span className="text-slate-600 text-sm font-medium">Eficiência do Sistema:</span>
                  <span className="text-xl font-bold text-blue-900">{(dadosResultado.calculo.prUtilizado * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-600 text-sm font-medium">Área Estimada:</span>
                  <span className="text-xl font-bold text-blue-900">{(dadosResultado.calculo.qtdPaineis * 2.2).toFixed(1)} m²</span>
                </div>
              </div>
            </div>

            {/* GRÁFICO DE GERAÇÃO: FULL WIDTH NA LINHA DE BAIXO */}
            <div className="lg:col-span-3 bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Geração Mensal Estimada (kWh)</h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 rounded-full" /> Geração Ideal</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-200 rounded-full" /> Abaixo do Consumo</div>
                </div>
              </div>
              
              <div className="h-[400px] w-full bg-slate-50/50 rounded-3xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosResultado.grafico}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 12}} 
                    />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="producao" radius={[8, 8, 0, 0]} barSize={40}>
                      {dadosResultado.grafico.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.producao >= dadosResultado.calculo.consumo ? '#2563eb' : '#cbd5e1'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Espaço para Banner/Ads */}
      <div className="flex flex-col items-center gap-4 mt-16">
            <img src="/adsDev.png" alt="Publicidade" className='w-full max-w-[350px] h-auto rounded-2xl shadow-md opacity-90'/>
          </div>
    </div>
  );
}