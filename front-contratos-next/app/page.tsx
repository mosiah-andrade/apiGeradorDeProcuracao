"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ReactGA from "react-ga4";
import ConteudoSite from '../components/ConteudoSite';
import listaConcessionarias from '../public/concessionarias.json';
import ComboboxConcessionaria from '@/components/ComboboxConcessionaria';

// Imports dos novos componentes
import { FormData } from './types';
import { formatarCpfCnpj, formatarCep, formatarRG } from '@/utils/formatters';
import ProgressBar from '@/components/ProgressBar';
import DownloadModal from '@/components/DownloadModal';
import StepCliente from '@/components/steps/StepCliente';
import StepUnidade from '@/components/steps/StepUnidade';
import StepContratado from '@/components/steps/StepContratado';

export default function Home() {
  const [showFormModal, setShowFormModal] = useState(false);
  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [readyToDownload, setReadyToDownload] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);

  const titulosEtapas = ["Dados do Cliente", "Dados da Unidade Consumidora", "Dados do Contratado"];

  const [formData, setFormData] = useState<FormData>({
    nome: '', cpf: '', rg: '', orgao_emissor: '',
    endereco: '', cidade: '', classificacao: 'Monofásico',
    contacontrato: '', bairro: '', cep: '',
    concessionaria: '', cidade_concessionaria: '', cnpj_concessionaria: '',
    representante: '', cpf_representante: '',
    nome_CONTRATADO: '', rg_CONTRATADO: '', orgao_emissor_CONTRATADO: '',
    cpf_CONTRATADO: '', endereco_CONTRATADO: ''
  });

  // --- EFFECTS ---
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

  // trava o scroll do body enquanto o modal de formulário estiver aberto
  useEffect(() => {
    if (showFormModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showFormModal]);

  // --- HANDLERS ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let novoValor = value;
    
    if (name.includes('cpf')) novoValor = formatarCpfCnpj(value);
    else if (name === 'cep') novoValor = formatarCep(value);
    else if (name.includes('rg')) novoValor = formatarRG(value);
    else if (name.includes('orgao')) novoValor = value.toUpperCase();
    
    setFormData(prev => {
        const newState = { ...prev, [name]: novoValor };
        if (name === 'concessionaria') {
            const empresa = listaConcessionarias.find(c => c.slug === novoValor);
            newState.cidade_concessionaria = empresa ? empresa.cidade_sede : '';
            newState.cnpj_concessionaria = empresa ? empresa.cnpj : '';
        }
        return newState;
    });
  };

  const handleSelectConcessionaria = (slug: string) => {
    setFormData(prev => {
      const newState = { ...prev, concessionaria: slug } as typeof prev;
      const empresa = listaConcessionarias.find(c => c.slug === slug);
      newState.cidade_concessionaria = empresa ? empresa.cidade_sede : '';
      newState.cnpj_concessionaria = empresa ? empresa.cnpj : '';
      return newState;
    });
  };

  const prepararPayloadParaAPI = () => {
    const documentoLimpo = formData.cpf.replace(/\D/g, '');
    const isPJ = documentoLimpo.length > 11;
    const arquivoModelo = isPJ ? 'modelo_pj.docx' : 'modelo_pf.docx';
    
    const dadosConcessionaria = listaConcessionarias.find(c => c.slug === formData.concessionaria);
    const dataHoje = new Date();
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    return {
      arquivo_modelo: arquivoModelo,
      ...formData, // Espalha todos os dados do form
      CONCESSIONARIA: dadosConcessionaria ? dadosConcessionaria.nome : formData.concessionaria.toUpperCase(),
      CNPJ_CONCESSIONARIA: formData.cnpj_concessionaria,
      CIDADE_CONCESSIONARIA: formData.cidade_concessionaria,
      REPRESENTANTE: formData.representante, 
      CPF_DO_REPRESENTANTE: formData.cpf_representante,
      DIA: dataHoje.getDate().toString(),
      MES: meses[dataHoje.getMonth()],
      ANO: dataHoje.getFullYear().toString(),
    };
  };

 const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(s => s + 1); return; }
    if (!formData.concessionaria) { alert("Selecione uma concessionária."); return; }
    
    // 1. Prepara o estado para o download
    setReadyToDownload(false);
    setDownloadBlob(null); 
    setTimeLeft(15); 
    
    // 2. A MÁGICA ACONTECE AQUI: Abre o anúncio e fecha o formulário
    setShowAdModal(true); 
    setShowFormModal(false); 
    
    setLoading(true);
    
    ReactGA.event({ category: "Documento", action: "Clicou Gerar", label: formData.concessionaria });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_PHP_URL || process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '' },
        body: JSON.stringify(prepararPayloadParaAPI()),
      });

      if (!response.ok) throw new Error('Erro ao gerar documento.');
      setDownloadBlob(await response.blob());
      
    } catch (error: any) {
      alert('Erro: ' + error.message);
      // Se der erro, fecha o modal de anúncio e devolve o formulário para o usuário não perder os dados
      setShowAdModal(false);
      setShowFormModal(true);
    } finally {
      setLoading(false);
      // Resetar o step para 0 caso queira que o próximo formulário comece do início
      // setStep(0); 
    }
  };

  const baixarArquivoReal = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Procuracao_${formData.nome.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // --- RENDER ---
  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      {step === 0 && <StepCliente formData={formData} handleChange={handleChange} />}
      {step === 1 && <StepUnidade formData={formData} handleChange={handleChange} />}
      {step === 2 && <StepContratado formData={formData} handleChange={handleChange} />}

      <div className="button-group">
        {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn-back">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width: 16, height: 16}} aria-hidden>
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L4.414 9H18a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span style={{marginLeft: 8}}>Voltar</span>
            </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={() => setStep(s => s + 1)} className="btn-primary">Próximo</button>
        ) : (
          <button type="submit" disabled={loading} className="btn-success">
            {loading ? 'Gerando...' : 'Gerar Documento'}
          </button>
        )}
      </div>
    </form>
  );

  return (
    <main className="page-wrapper">
      <section className="hero py-12" style={{backgroundImage: "url('/hero.jpg')", color: '#fff', width: '100%', display: 'flex', flexDirection: 'row-reverse', height: '80vh', backgroundSize: 'cover', backgroundPosition: 'center', paddingRight: '150px'}}>
        
        <div className="container" style={{maxHeight: 'fit-content', width: '700px', backgroundColor: 'rgba(17, 24, 39, 0.93)', padding: '30px', borderRadius: '12px'}}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-3">Gerador de Procuração Solar</h1>
              <p className="text-gray-600 mb-6">Selecione sua concessionária abaixo e clique em Gerar Procuração para abrir o formulário.</p>
              <div style={{maxWidth: '100%', marginBottom: 22}}>
                <ComboboxConcessionaria value={formData.concessionaria} onChange={handleSelectConcessionaria}  />
              </div>
            </div>

            {/* Card flutuante à direita */}
            <div className="flex justify-center md:justify-end">
              <div className="min-w-[320px] bg-white rounded-xl shadow-xl p-6" style={{transform: 'translateY(-10px)'}}>
                <h3 className="text-lg font-semibold mb-2">Pronto para gerar</h3>
                <p className="text-sm text-gray-500 mb-4">A concessionária selecionada ficará pré-selecionada no formulário.</p>
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => setShowFormModal(true)}
                >
                  Gerar Procuração
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      <ConteudoSite />

      <DownloadModal 
        isOpen={showAdModal}
        timeLeft={timeLeft}
        readyToDownload={readyToDownload}
        onClose={() => setShowAdModal(false)}
      />

      {/* Modal flutuante que sobrepõe a tela e contém o formulário (oculto até abrir) */}
      {showFormModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* <button className="text-gray-500 hover:text-gray-800" onClick={() => setShowFormModal(false)} style={{backgroundColor: 'transparent'}}>x</button> */}
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12}}>
                <h3 className="text-xl font-semibold ">Gerar Procuração</h3>
              </div>

              <div style={{marginBottom: 16}}>
                <ProgressBar step={step} />
                <h2 style={{marginTop: 12}}>{titulosEtapas[step]}</h2>
              </div>

              {renderForm()}
            </div>
        </div>
      )}
    </main>
  );
}