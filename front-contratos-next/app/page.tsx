"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ReactGA from "react-ga4";
import ConteudoSite from '../components/ConteudoSite';
import listaConcessionarias from '../public/concessionarias.json';

// Imports dos novos componentes
import { FormData } from './types';
import { formatarCpfCnpj, formatarCep, formatarRG } from '@/utils/formatters';
import ProgressBar from '@/components/ProgressBar';
import DownloadModal from '@/components/DownloadModal';
import StepCliente from '@/components/steps/StepCliente';
import StepUnidade from '@/components/steps/StepUnidade';
import StepContratado from '@/components/steps/StepContratado';

export default function Home() {
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
    
    setReadyToDownload(false);
    setDownloadBlob(null); 
    setTimeLeft(15); 
    setShowAdModal(true); 
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
      setShowAdModal(false);
    } finally {
      setLoading(false);
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
  return (
    <main className="page-wrapper">
      <div className="container form">
        <header>
          <h1>Gerador de Procuração Solar</h1>
          <ProgressBar step={step} />
          <h2>{titulosEtapas[step]}</h2>
        </header>

        <form onSubmit={handleSubmit}>
          {step === 0 && <StepCliente formData={formData} handleChange={handleChange} />}
          {step === 1 && <StepUnidade formData={formData} handleChange={handleChange} />}
          {step === 2 && <StepContratado formData={formData} handleChange={handleChange} />}

          <div className="button-group">
            {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary">Voltar</button>
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
      </div>
      
      <ConteudoSite />
      
      <DownloadModal 
        isOpen={showAdModal}
        timeLeft={timeLeft}
        readyToDownload={readyToDownload}
        onClose={() => setShowAdModal(false)}
      />
    </main>
  );
}