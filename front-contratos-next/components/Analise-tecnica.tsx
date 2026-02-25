"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnaliseTecnica() {
  const [loading, setLoading] = useState(false);
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([]);
  const [calculo, setCalculo] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const cep = formData.get('cep') as string;
    const consumo = Number(formData.get('consumo'));
    const pPainel = Number(formData.get('potenciaPainel'));

    try {
      const cepRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      const dataCep = await cepRes.json();
      let lat = dataCep.location?.coordinates?.latitude;
      let lon = dataCep.location?.coordinates?.longitude;

      if (!lat || !lon) {
         console.warn("Coordenadas exatas não encontradas, tentando via cidade...");
         const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&city=${dataCep.city}&state=${dataCep.state}&country=Brazil&limit=1`);
         const geoData = await geoRes.json();
         if (geoData.length > 0) {
           lat = geoData[0].lat;
           lon = geoData[0].lon;
         } else {
           throw new Error("Não foi possível localizar as coordenadas para este CEP.");
         }
      }

      const nasaUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;
      const nasaRes = await fetch(nasaUrl);
      if (!nasaRes.ok) throw new Error("Erro na API da NASA");
      const nasaData = await nasaRes.json();
      const irradiancia = nasaData.properties.parameter.ALLSKY_SFC_SW_DWN;

      const hspAnual = irradiancia.ANN;
      const PR = 0.80; 
      const potenciaSistema = consumo / (hspAnual * 30 * PR);
      const qtdPaineis = Math.ceil((potenciaSistema * 1000) / pPainel);
      
      const custoEstimado = potenciaSistema * 3800; 
      const economiaMensal = consumo * 0.95; 
      const paybackAnos = custoEstimado / (economiaMensal * 12);

      const mesesTratados = Object.entries(irradiancia)
        .filter(([mes]) => mes !== 'ANN')
        .map(([mes, hspMes]) => ({
          name: mes,
          hsp: Number(hspMes).toFixed(2),
          producao: Number(((pPainel * qtdPaineis / 1000) * (hspMes as number) * 30 * PR).toFixed(0))
        }));

      setDadosGrafico(mesesTratados);
      setCalculo({ 
        potenciaSistema, 
        qtdPaineis, 
        custoEstimado, 
        paybackAnos, 
        consumo,
        lat: lat,
        lon: lon,
        hspAnual
      });
    } catch (err) {
      alert("Erro ao processar dados. Verifique o CEP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-white text-slate-900" >
        <h2 className="text-center text-xl font-bold text-slate-700 mb-4">Análise Técnica</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-xl mb-8 border border-slate-200">
        <div>
          <label className="block text-xs font-bold mb-1 text-slate-500 uppercase" style={{marginTop: "18px"}}>CEP Local</label>
          <input name="cep" placeholder="00000-000" className="w-full p-3 border rounded text-black outline-blue-500" required style={{color: "black", paddingLeft: "5px"}}/>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-slate-500 uppercase" style={{marginTop: "18px"}}>Consumo (kWh/mês)</label>
          <input name="consumo" type="number" placeholder="Ex: 500" className="w-full p-3 border rounded text-black outline-blue-500" required style={{color: "black", paddingLeft: "5px"}}/>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-slate-500 uppercase" style={{marginTop: "18px"}}>Modelo do Painel</label>
          <select name="potenciaPainel" className="w-full p-3 border rounded text-black outline-blue-500" required style={{color: "black", backgroundColor: "#e8f0fe", }}>
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
        <button type="submit" disabled={loading}  
        style={{backgroundColor: "var(--azul-600)",
         color: "white", 
         fontWeight: "bold", 
         borderRadius: "8px", 
         height: "50px", 
         marginTop: "8px"}}>
          {loading ? "PROCESSANDO..." : "CALCULAR PROJETO"}
        </button>
      </form>

      {calculo && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Coluna de Dados Técnicos */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-blue-400 font-bold mb-4 uppercase text-xs tracking-widest">Dimensionamento</h2>
              <div className="text-4xl font-black mb-2">{calculo.potenciaSistema.toFixed(2)}<span className="text-lg ml-1 text-blue-300"> kWp</span></div>
              <p className="text-slate-400 text-sm mb-6">Sugestão: {calculo.qtdPaineis} módulos</p>
              
              <div className="space-y-3 text-sm border-t border-slate-800 pt-4">
                <div className="flex justify-between"><span>Lat/Lon:</span> <span className="text-slate-400">{Number(calculo.lat).toFixed(2)} / {Number(calculo.lon).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>HSP Médio:</span> <span className="text-slate-400">{calculo.hspAnual.toFixed(2)} h/dia</span></div>
                <div className="flex justify-between"><span>Área Ocupada:</span> <span className="text-slate-400">{(calculo.qtdPaineis * 2.2).toFixed(1)} m²</span></div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
              <h2 className="text-green-800 font-bold mb-2 uppercase text-xs">Retorno Financeiro</h2>
              <div className="text-2xl font-bold text-green-700">R$ {calculo.custoEstimado.toLocaleString('pt-br', {minimumFractionDigits: 2})}</div>
              <p className="text-xs text-green-600 mb-4">Investimento estimado</p>
              <div className="bg-white p-3 rounded-lg border border-green-100">
                <span className="text-slate-500 text-xs block">Payback estimado: </span>
                <span className="text-xl font-bold text-slate-800">{calculo.paybackAnos.toFixed(1)} Anos</span>
              </div>
            </div>
          </div>

          {/* Coluna do Gráfico */}
          <div className="xl:col-span-3 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" style={{width: '100%'}}>
            <h3 className="font-bold text-slate-700 mb-6 uppercase text-sm">Geração Mensal Esperada (kWh)</h3>
            <div style={{  height: '350px', maxWidth: "600px", margin: "0 auto", backgroundColor: "#011b36", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{color: "black", backgroundColor: "white", padding: "8px", borderRadius: "6px", borderColor: "#144f9b"}}>
                              <p className="font-bold text-slate-800">{payload[0].payload.name}</p>
                              <p className="text-blue-600">Produção: {payload[0].value} kWh</p>
                              <p className="text-slate-400 text-xs">Radiação: {payload[0].payload.hsp} h/dia</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="producao" radius={[4, 4, 0, 0]}>
                      {dadosGrafico.map((entry, index) => (
                        <Cell key={index} fill={entry.producao >= calculo.consumo ? '#3b82f6' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-6 justify-center text-[10px] font-bold uppercase tracking-widest border-t pt-4">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Geração Sobrando</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-300 rounded-full"></span> Dependência da Rede</div>
                <div className="flex items-center gap-2 text-slate-400">Eficiência PR: 80%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}