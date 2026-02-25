"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnaliseTecnica() {
  const [loading, setLoading] = useState(false);
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([]);
  const [calculo, setCalculo] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    const rawCep = String(formData.get('cep') || '').replace(/\D/g, '');
    const consumo = Number(formData.get('consumo')) || 0;
    const pPainel = Number(formData.get('potenciaPainel')) || 0;

    // validação básica
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
      const cepRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${rawCep}`);
      if (!cepRes.ok) throw new Error('CEP não encontrado.');
      const dataCep = await cepRes.json();
      
      // extrair coordenadas de múltiplas estruturas possíveis
      let lat: any = undefined;
      let lon: any = undefined;
      const loc = dataCep.location;
      if (loc) {
        if (loc.coordinates && typeof loc.coordinates === 'object' && 'latitude' in loc.coordinates) {
          lat = loc.coordinates.latitude;
          lon = loc.coordinates.longitude;
        } else if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
          lon = loc.coordinates[0];
          lat = loc.coordinates[1];
        }
      }
      if ((!lat || !lon) && dataCep.latitude && dataCep.longitude) {
        lat = dataCep.latitude;
        lon = dataCep.longitude;
      }

      if (!lat || !lon) {
        const city = encodeURIComponent(dataCep.city || '');
        const state = encodeURIComponent(dataCep.state || '');
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&city=${city}&state=${state}&country=Brazil&limit=1`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          lat = geoData[0].lat;
          lon = geoData[0].lon;
        } else {
          throw new Error('Não foi possível localizar as coordenadas.');
        }
      }

      const nasaUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;
      const nasaRes = await fetch(nasaUrl);
      if (!nasaRes.ok) throw new Error('Erro ao buscar dados de radiação (NASA).');
      const nasaData = await nasaRes.json();
      const irradiancia = nasaData.properties.parameter.ALLSKY_SFC_SW_DWN;

      const hspAnual = Number(irradiancia.ANN) || 0;
      const PR = 0.8;
      const potenciaSistema = hspAnual > 0 ? consumo / (hspAnual * 30 * PR) : 0;
      const qtdPaineis = potenciaSistema > 0 ? Math.max(1, Math.ceil((potenciaSistema * 1000) / pPainel)) : 0;
      
      const custoEstimado = potenciaSistema * 3800;
      const tarifaMed = 0.95; // R$/kWh
      const economiaMensal = consumo * tarifaMed;
      const paybackAnos = economiaMensal > 0 ? custoEstimado / (economiaMensal * 12) : 0;

      const mesesTratados = Object.entries(irradiancia)
        .filter(([mes]) => mes !== 'ANN')
        .map(([mes, hspMes]) => {
          const hspNum = Number(hspMes) || 0;
          const producao = hspNum > 0 && qtdPaineis > 0
            ? Math.round(((pPainel * qtdPaineis) / 1000) * hspNum * 30 * PR)
            : 0;
          return { name: mes, hsp: hspNum.toFixed(2), producao };
        });

      setDadosGrafico(mesesTratados);
      setCalculo({ 
        potenciaSistema, 
        qtdPaineis, 
        custoEstimado, 
        paybackAnos, 
        consumo,
        lat,
        lon,
        hspAnual
      });
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  text-slate-900 max-w-[90vw] m-auto">
      <h2 className="text-center text-xl font-bold text-slate-700 mb-4">Análise Técnica</h2>

      {error && (
        <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-wrap gap-4 p-6 bg-slate-50 rounded-xl  border border-slate-200">
        <div>
          <label className="block text-xs font-bold mb-2 text-slate-600 uppercase">CEP Local</label>
          <input 
            name="cep" 
            placeholder="00000-000" 
            className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-2 text-slate-600 uppercase">Consumo (kWh/mês)</label>
          <input 
            name="consumo" 
            type="number" 
            placeholder="Ex: 500" 
            className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-2 text-slate-600 uppercase">Modelo do Painel</label>
          <select 
            name="potenciaPainel" 
            className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="400">Painel 400W</option>
            <option value="450">Painel 450W</option>
            <option value="500">Painel 500W</option>
            <option value="550">Painel 550W</option>
            <option value="565">Painel 565W</option>
            <option value="600">Painel 600W</option>
            <option value="650">Painel 650W</option>
            <option value="670">Painel 670W</option>
            <option value="700">Painel 700W</option>
          </select>
        </div>
        <div>
          <label className=" text-xs font-bold mb-2 text-slate-600 uppercase opacity-0 flex justify-center m-auto align-center">Calcular</label>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full  bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded transition"
          >
            {loading ? "PROCESSANDO..." : "CALCULAR"}
          </button>
        </div>
      </form>

      {calculo && (
        <div className="flex flex-wrap gap-6 justify-center">
          {/* Coluna de Dados Técnicos */}
          <div className=" flex flex-row  flex-wrap justify-around gap-6 lg:gap-12 width-full ">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-blue-400 font-bold mb-4 uppercase text-xs tracking-wide">Dimensionamento</h3>
              <div className="text-4xl font-black mb-2">
                {calculo.potenciaSistema.toFixed(2)}
                <span className="text-lg ml-1 text-blue-300"> kWp</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">Sugestão: {calculo.qtdPaineis} módulos</p>
              
              <div className="space-y-2 text-sm border-t border-slate-800 pt-4">
                <div className="flex justify-between">
                  <span>Lat/Lon:</span>
                  <span className="text-slate-300">{Number(calculo.lat).toFixed(2)} / {Number(calculo.lon).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>HSP Médio:</span>
                  <span className="text-slate-300">{calculo.hspAnual.toFixed(2)} h/dia</span>
                </div>
                <div className="flex justify-between">
                  <span>Área Ocupada: </span>
                  <span className="text-slate-300">{ (calculo.qtdPaineis * 2.2).toFixed(1)} m²</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
              <h3 className="text-green-800 font-bold mb-2 uppercase text-xs">Retorno Financeiro</h3>
              <div className="text-2xl font-bold text-green-700">
                R$ {calculo.custoEstimado.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-600 mb-4">Investimento estimado</p>
              <div className="bg-white p-3 rounded-lg border border-green-100">
                <span className="text-slate-500 text-xs block">Payback estimado:</span>
                <span className="text-xl font-bold text-slate-800">{calculo.paybackAnos.toFixed(1)} Anos</span>
              </div>
            </div>
          </div>

          {/* Coluna do Gráfico */}
          <div className="lg:col-span-3 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-700 mb-6 uppercase text-sm">Geração Mensal Esperada (kWh)</h3>
            <div className="h-80 bg-slate-900 rounded-lg p-2 flex items-center justify-center">
              {isMounted && dadosGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip 
                      cursor={{ fill: '#1f2937' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white text-slate-900 p-2 rounded border border-slate-300">
                              <p className="font-bold">{payload[0].payload.name}</p>
                              <p className="text-blue-600">Produção: {payload[0].value} kWh</p>
                              <p className="text-slate-500 text-xs">Radiação: {payload[0].payload.hsp} h/dia</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="producao" radius={[4, 4, 0, 0]}>
                      {dadosGrafico.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={entry.producao >= calculo.consumo ? '#3b82f6' : '#cbd5e1'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400">Carregando gráfico...</p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs font-bold uppercase tracking-wide border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Geração Sobrando
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                Dependência da Rede
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                Eficiência PR: 80%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}