"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ReactGA from "react-ga4";
import { formatarCpfCnpj, formatarRG } from '@/utils/formatters';
import DownloadModal from '@/components/DownloadModal';
import AdSenseBanner from '@/components/AdSenseBanner';

export default function DeclaracaoPosse() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [readyToDownload, setReadyToDownload] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [adKey, setAdKey] = useState(0);

  const [formData, setFormData] = useState({
    proprietario: '',
    cpf_proprietario: '',
    rg_proprietario: '',
    endereco: '',
    inicio_permanencia: '',
    motivo: '',
    nome_documento: 'Declaração de Posse',
    cidade: ''
  });

  useEffect(() => {
    ReactGA.initialize("G-BLV25S4PX9");
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAdModal && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && showAdModal && downloadBlob && !readyToDownload) {
      setReadyToDownload(true);
      baixarArquivoReal(downloadBlob);
    }
    return () => clearTimeout(timer);
  }, [showAdModal, timeLeft, downloadBlob, readyToDownload]);

  useEffect(() => {
    if (showFormModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showFormModal]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let novoValor = value;
    if (name === 'cpf_proprietario') novoValor = formatarCpfCnpj(value);
    else if (name === 'rg_proprietario') novoValor = formatarRG(value);
    setFormData(prev => ({ ...prev, [name]: novoValor }));
  };

  const prepararPayloadParaAPI = () => {
    const dataHoje = new Date();
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return {
      arquivo_modelo: 'modelo_declaracao.docx',
      Proprietário: formData.proprietario,
      CPF_proprietario: formData.cpf_proprietario,
      "RG-proprietario": formData.rg_proprietario,
      Endereco: formData.endereco,
      Inicio_permanencia: formData.inicio_permanencia,
      Motivo: formData.motivo,
      Nome_documento: formData.nome_documento,
      Cidade: formData.cidade,
      Dia: dataHoje.getDate().toString(),
      Mes: meses[dataHoje.getMonth()],
      Ano: dataHoje.getFullYear().toString(),
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setReadyToDownload(false);
    setDownloadBlob(null);
    setTimeLeft(15);
    setAdKey(prev => prev + 1);
    setShowAdModal(true);
    setShowFormModal(false);
    setLoading(true);
    ReactGA.event({ category: "Documento", action: "Gerar Posse", label: formData.cidade });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_PHP_URL || process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '' 
        },
        body: JSON.stringify(prepararPayloadParaAPI()),
      });
      if (!response.ok) throw new Error('Erro ao gerar documento.');
      setDownloadBlob(await response.blob());
    } catch (error: any) {
      alert('Erro: ' + error.message);
      setShowAdModal(false);
      setShowFormModal(true);
    } finally {
      setLoading(false);
    }
  };

  const baixarArquivoReal = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Declaracao_Posse_${formData.proprietario.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* GRID CORRIGIDO: 1 coluna no mobile, 2 no desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Proprietário/Possuidor</label>
          <input type="text" name="proprietario" value={formData.proprietario} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
          <input type="text" name="cpf_proprietario" value={formData.cpf_proprietario} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">RG</label>
          <input type="text" name="rg_proprietario" value={formData.rg_proprietario} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Endereço Completo do Imóvel</label>
          <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Início da Permanência</label>
          <input type="text" name="inicio_permanencia" value={formData.inicio_permanencia} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Janeiro de 2015" required />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Cidade/UF</label>
          <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Motivo da Declaração</label>
          <input type="text" name="motivo" value={formData.motivo} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: solicitação de novo padrão de energia" required />
        </div>
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-xl font-extrabold hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
        {loading ? 'Gerando Documento...' : 'Gerar Declaração Agora'}
      </button>
    </form>
  );

  return (
    <main className="page-wrapper bg-gray-50 min-h-screen">
      <section className="hero w-full min-h-[70vh] py-12 flex flex-col justify-center items-center text-center md:flex-row md:justify-end md:items-center md:text-left md:pr-[10%] lg:pr-[150px]" 
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/hero-posse.png')", color: '#fff', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        
        <div className="max-h-fit max-w-[500px] w-[92vw] sm:w-[85vw] bg-gray-900/95 p-6 md:p-10 rounded-2xl shadow-2xl border border-white/10">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-white">Gerador de Declaração de Posse</h1>
          <p className="text-gray-300 mb-8 text-sm md:text-base leading-relaxed">Crie sua declaração de posse de imóvel de forma rápida, gratuita e profissional.</p>
          
          <button type="button" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-transform hover:scale-105" onClick={() => setShowFormModal(true)}>
            Preencher Formulário
          </button>
        </div>
      </section>

      {/* Conteúdo Informativo Otimizado */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">O que é a Declaração de Posse?</h2>
          <p className="text-gray-600 leading-relaxed">A Declaração de Posse é um documento utilizado para comprovar que uma pessoa detém a posse de um imóvel, mesmo sem o registro definitivo. É fundamental para processos de regularização e pedidos de serviços públicos.</p>
        </section>

        <AdSenseBanner />

        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Como Funciona?</h2>
            <p className="text-gray-600 text-sm">Basta preencher os dados do possuidor e do imóvel. Nosso sistema gera automaticamente um arquivo .docx (Word) seguindo os padrões aceitos por concessionárias de energia e órgãos públicos.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quem pode usar?</h2>
            <p className="text-gray-600 text-sm">Qualquer cidadão que precise formalizar a posse para fins administrativos, como instalação de energia solar, água ou comprovação de residência em áreas em processo de regularização.</p>
          </div>
        </section>

        <AdSenseBanner />
      </div>

      <DownloadModal isOpen={showAdModal} timeLeft={timeLeft} readyToDownload={readyToDownload} onClose={() => setShowAdModal(false)} adKey={adKey} />

      {/* Modal de Formulário com Scroll e Espaçamento Mobile */}
      {showFormModal && (
        <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50" onClick={() => setShowFormModal(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-xl font-bold text-gray-800">Dados da Declaração</h3>
              <button onClick={() => setShowFormModal(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full w-10 h-10 flex items-center justify-center transition-colors">&times;</button>
            </div>
            <div className="pb-8">
               {renderForm()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}