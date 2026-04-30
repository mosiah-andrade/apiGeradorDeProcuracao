"use client";

import React, { useState } from 'react';

interface AnaliseTecnicaProps {
  onCalcular: (dados: any) => void;
}

export default function AnaliseTecnica({ onCalcular }: AnaliseTecnicaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const rawCep = String(formData.get('cep') || '').replace(/\D/g, '');
    const consumoInformado = Number(formData.get('consumo')) || 0;
    const pPainel = Number(formData.get('potenciaPainel')) || 0;
    const qtdManual = Number(formData.get('qtdManual')) || 0;

    if (!rawCep || rawCep.length < 8) {
      setError('Informe um CEP válido (8 dígitos).');
      setLoading(false);
      return;
    }
    if (consumoInformado <= 0 || pPainel <= 0) {
      setError('Consumo e potência do painel devem ser maiores que zero.');
      setLoading(false);
      return;
    }

    try {
      // 1. Busca de Localização (CEP)
      const cepRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${rawCep}`);
      if (!cepRes.ok) throw new Error('CEP não encontrado.');
      const dataCep = await cepRes.json();

      let lat = dataCep.location?.coordinates?.latitude || dataCep.latitude;
      let lon = dataCep.location?.coordinates?.longitude || dataCep.longitude;

      if (!lat || !lon) {
        const city = encodeURIComponent(dataCep.city || '');
        const state = encodeURIComponent(dataCep.state || '');
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&city=${city}&state=${state}&country=Brazil&limit=1`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          lat = Number(geoData[0].lat);
          lon = Number(geoData[0].lon);
        } else {
          throw new Error('Não foi possível localizar as coordenadas.');
        }
      }

      // 2. Busca de Irradiação (NASA)
      const nasaRes = await fetch(`https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`);
      if (!nasaRes.ok) throw new Error('Erro ao buscar dados de radiação.');
      const nasaData = await nasaRes.json();
      const irradiancia = nasaData.properties.parameter.ALLSKY_SFC_SW_DWN;

      // --- LÓGICA DE CÁLCULO CORRIGIDA ---
      const hspAnual = Number(irradiancia.ANN) || 0;
      const PR = (lat > -15 && lat < 5) ? 0.75 : 0.80;

      // Dimensionamento
      const potenciaNecessaria = hspAnual > 0 ? consumoInformado / (hspAnual * 30 * PR) : 0;
      let qtdPaineis = qtdManual > 0 ? qtdManual : Math.max(1, Math.ceil((potenciaNecessaria * 1000) / pPainel));
      const potenciaRealInstalada = (qtdPaineis * pPainel) / 1000;

      // Geração Mensal Estimada (Média)
      const geracaoMensalMedia = potenciaRealInstalada * hspAnual * 30 * PR;

      // O ponto chave: A economia é limitada pelo que o sistema gera!
      // Se o consumo é 50.000 mas gera 300, a economia é sobre os 300.
      const consumoAbatido = Math.min(consumoInformado, geracaoMensalMedia);

      // Preço de mercado estimado (Escalável)
      let precoPorKwp = 4500;
      if (potenciaRealInstalada >= 4) precoPorKwp = 3800;
      if (potenciaRealInstalada >= 10) precoPorKwp = 3100;
      if (potenciaRealInstalada >= 50) precoPorKwp = 2700;
      const custoEstimado = Math.round(potenciaRealInstalada * precoPorKwp);

      // Configurações Tarifárias
      const tarifaMed = 0.95;
      const tarifaFioB = 0.25;
      const percentualFioB = 0.60; // Em 2026 o encargo é 60%
      const simultaneidade = 0.30; // 30% consumido na hora, 70% injetado
      const taxaMinimaKwh = 50;

      // Economia Detalhada
      const economiaDireta = (consumoAbatido * simultaneidade) * tarifaMed;
      const energiaInjetada = Math.max(0, (consumoAbatido * (1 - simultaneidade)) - taxaMinimaKwh);
      const custoFioB = energiaInjetada * (tarifaFioB * percentualFioB);
      const economiaInjetadaLiquida = (energiaInjetada * tarifaMed) - custoFioB;
      
      const economiaLiquidaMensalBase = economiaDireta + economiaInjetadaLiquida;

      // Cálculo de Payback Realista
      let investimentoRestante = custoEstimado;
      let mesesPayback = 0;
      let economiaMensalAtual = economiaLiquidaMensalBase;

      if (economiaLiquidaMensalBase > 0) {
        while (investimentoRestante > 0 && mesesPayback < 300) {
          mesesPayback++;
          investimentoRestante -= economiaMensalAtual;
          // Reajuste anual da tarifa de energia (IPCA/IGPM est. 5%)
          if (mesesPayback % 12 === 0) economiaMensalAtual *= 1.05;
        }
      } else {
        mesesPayback = 999;
      }
      
      const paybackAnos = mesesPayback / 12;

      // Dados para o Gráfico Mensal
      const mesesTratados = Object.entries(irradiancia)
        .filter(([mes]) => mes !== 'ANN')
        .map(([mes, hspMes]) => {
          const hspNum = Number(hspMes) || 0;
          const producao = Math.round(potenciaRealInstalada * hspNum * 30 * PR);
          return { name: mes, hsp: hspNum.toFixed(2), producao };
        });

      onCalcular({
        calculo: {
          potenciaSistema: potenciaRealInstalada,
          qtdPaineis,
          custoEstimado,
          paybackAnos,
          consumo: consumoInformado,
          geracaoMensalMedia,
          hspAnual,
          prUtilizado: PR,
          custoFioB: custoFioB, 
          economiaMensal: economiaLiquidaMensalBase,
          percentualFioB: percentualFioB * 100
        },
        grafico: mesesTratados
      });

    } catch (err: any) {
      setError(err?.message || 'Erro ao processar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Análise Técnica</h2>
        {loading && <span className="text-[10px] text-blue-600 animate-pulse font-bold">Processando Dados...</span>}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">CEP da Instalação</label>
            <input 
              name="cep" 
              placeholder="00000-000" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Consumo Mensal (kWh)</label>
            <input 
              name="consumo" 
              type="number" 
              placeholder="Ex: 500" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white"
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Potência do Painel (W)</label>
            <input 
              name="potenciaPainel" 
              type="number"
              placeholder="Ex: 550" 
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white"
              required  
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qtd. Placas (Opcional)</label>
            <input 
              name="qtdManual" 
              type="number" 
              placeholder="Cálculo Automático" 
              className="w-full px-4 py-3 border border-slate-100 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none italic"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-[0.99] uppercase text-xs tracking-widest mt-2"
        >
          {loading ? "Consultando NASA e Calculando..." : "Gerar Análise Completa"}
        </button>
      </form>
    </div>
  );
}
