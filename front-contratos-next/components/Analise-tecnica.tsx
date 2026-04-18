"use client";

import React, { useState, useEffect } from 'react';

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
    const consumo = Number(formData.get('consumo')) || 0;
    const pPainel = Number(formData.get('potenciaPainel')) || 0;
    const qtdManual = Number(formData.get('qtdManual')) || 0;

    if (!rawCep || rawCep.length < 8) {
      setError('Informe um CEP válido (8 dígitos).');
      setLoading(false);
      return;
    }
    if (consumo <= 0 || pPainel <= 0) {
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

      // --- LÓGICA DE CÁLCULO ---
      const hspAnual = Number(irradiancia.ANN) || 0;
      const PR = (lat > -15 && lat < 5) ? 0.75 : 0.80;

      const potenciaNecessaria = hspAnual > 0 ? consumo / (hspAnual * 30 * PR) : 0;
      let qtdPaineis = qtdManual > 0 ? qtdManual : Math.max(1, Math.ceil((potenciaNecessaria * 1000) / pPainel));
      const potenciaRealInstalada = (qtdPaineis * pPainel) / 1000;

      let precoPorKwp = 4500;
      if (potenciaRealInstalada >= 4) precoPorKwp = 3800;
      if (potenciaRealInstalada >= 10) precoPorKwp = 3200;
      const custoEstimado = Math.round(potenciaRealInstalada * precoPorKwp);

      // Economia e Payback
      const tarifaMed = 0.95;
      const tarifaFioB = 0.25;
      const percentualFioB2026 = 0.60;
      const simultaneidade = 0.30;
      const taxaMinimaKwh = 50;

      const economiaDireta = (consumo * simultaneidade) * tarifaMed;
      const energiaInjetadaReal = Math.max(0, (consumo * (1 - simultaneidade)) - taxaMinimaKwh);
      const custoFioB = energiaInjetadaReal * (tarifaFioB * percentualFioB2026);
      const economiaInjetada = (energiaInjetadaReal * tarifaMed) - custoFioB;
      const economiaLiquidaMensalBase = economiaDireta + economiaInjetada;

      let investimentoRestante = custoEstimado;
      let mesesPayback = 0;
      let economiaMensalAtual = economiaLiquidaMensalBase;

      while (investimentoRestante > 0 && mesesPayback < 300) {
        mesesPayback++;
        investimentoRestante -= economiaMensalAtual;
        if (mesesPayback % 12 === 0) economiaMensalAtual *= 1.05;
      }
      const paybackAnos = mesesPayback / 12;

      // Montagem do Gráfico
      const mesesTratados = Object.entries(irradiancia)
        .filter(([mes]) => mes !== 'ANN')
        .map(([mes, hspMes]) => {
          const hspNum = Number(hspMes) || 0;
          const producao = hspNum > 0 && qtdPaineis > 0
            ? Math.round(potenciaRealInstalada * hspNum * 30 * PR)
            : 0;
          return { name: mes, hsp: hspNum.toFixed(2), producao };
        });

      // ENVIO DOS DADOS PARA O PAI
      onCalcular({
        calculo: {
          potenciaSistema: potenciaRealInstalada,
          qtdPaineis,
          custoEstimado,
          paybackAnos,
          consumo,
          hspAnual,
          prUtilizado: PR,
          custoFioB: custoFioB, 
          economiaMensal: economiaLiquidaMensalBase,
          percentualFioB: percentualFioB2026 * 100
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
    <div className="w-full">
      <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-700 uppercase">Análise Técnica</h2>
        {loading && <span className="text-[10px] text-blue-600 animate-pulse font-bold">Processando...</span>}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-b border-red-100 text-red-600 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold mb-1.5 text-slate-500 uppercase tracking-wider">CEP da Instalação</label>
            <input 
              name="cep" 
              placeholder="00000-000" 
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold mb-1.5 text-slate-500 uppercase tracking-wider">Consumo Mensal (kWh)</label>
            <input 
              name="consumo" 
              type="number" 
              placeholder="Ex: 500" 
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold mb-1.5 text-slate-500 uppercase tracking-wider">Potência do Painel (W)</label>
            <input 
              name="potenciaPainel" 
              type="number"
              placeholder="Ex: 550" 
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required  
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold mb-1.5 text-slate-500 uppercase tracking-wider text-slate-400">Qtd. Placas (Opcional)</label>
            <input 
              name="qtdManual" 
              type="number" 
              placeholder="Cálculo Automático" 
              className="w-full px-3 py-2.5 border border-slate-100 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-[0.98] uppercase text-xs tracking-widest"
        >
          {loading ? "Calculando..." : "Gerar Análise"}
        </button>
      </form>
    </div>
  );
}