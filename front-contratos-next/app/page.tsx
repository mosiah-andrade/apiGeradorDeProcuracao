"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ReactGA from "react-ga4";
import ConteudoSite from '../components/ConteudoSite';
import AdSenseBanner from '../components/AdSenseBanner';

// --- FUNÇÕES DE FORMATAÇÃO (MANTIDAS) ---
const formatarCpfCnpj = (value: string) => {
  const apenasNumeros = value.replace(/\D/g, '');
  const numerosLimitados = apenasNumeros.slice(0, 14);
  if (numerosLimitados.length <= 11) {
    return numerosLimitados
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  } else {
    return numerosLimitados
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
};
const formatarCep = (value: string) => value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
const formatarRG = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

interface FormData {
  nome: string; cpf: string; rg: string; orgao_emissor: string;
  endereco: string; cidade: string; classificacao: string;
  contacontrato: string; bairro: string; cep: string;
  concessionaria: string; representante: string; cpf_representante: string;
  nome_CONTRATADO: string; rg_CONTRATADO: string; orgao_emissor_CONTRATADO: string;
  cpf_CONTRATADO: string; endereco_CONTRATADO: string;
  [key: string]: string;
}

export default function Home() {
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
    concessionaria: '', representante: '', cpf_representante: '',
    nome_CONTRATADO: '', rg_CONTRATADO: '', orgao_emissor_CONTRATADO: '',
    cpf_CONTRATADO: '', endereco_CONTRATADO: ''
  });

  useEffect(() => {
    // Insira seu ID do GA4 aqui
    ReactGA.initialize("G-XXXXXXXXXX");
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  // --- TIMER E DOWNLOAD ---
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Se o modal está aberto e ainda tem tempo
    if (showAdModal && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } 
    // Se o tempo acabou e o arquivo já chegou da API
    else if (timeLeft === 0 && showAdModal && downloadBlob) {
      if (!readyToDownload) {
          setReadyToDownload(true);
          baixarArquivoReal(downloadBlob);
      }
    }
    
    return () => clearTimeout(timer);
  }, [showAdModal, timeLeft, downloadBlob, readyToDownload]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let novoValor = value;
    
    if (name.includes('cpf')) novoValor = formatarCpfCnpj(value);
    else if (name === 'cep') novoValor = formatarCep(value);
    else if (name.includes('rg')) novoValor = formatarRG(value);
    else if (name.includes('orgao')) novoValor = value.toUpperCase();
    
    setFormData(prev => ({ ...prev, [name]: novoValor }));
  };

  const nextStep = () => setStep(c => c + 1);
  const prevStep = () => setStep(c => c - 1);

  // --- CRUCIAL: MAPEAMENTO PARA O WORD ---
  const prepararPayloadParaAPI = () => {
    const documentoLimpo = formData.cpf.replace(/\D/g, '');
    const isPJ = documentoLimpo.length > 11;
    const concessionaria = formData.concessionaria.toLowerCase();
    const arquivoModelo = isPJ ? `modelo_pj-${concessionaria}.docx` : `modelo_pf-${concessionaria}.docx`;

    const dataHoje = new Date();
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    return {
      arquivo_modelo: arquivoModelo,
      
      // --- DADOS GERAIS ---
      NOME: formData.nome,
      CPF: formData.cpf,
      RG: formData.rg,
      ORGAO_EMISSOR: formData.orgao_emissor,
      ENDERECO: formData.endereco,
      CIDADE: formData.cidade,
      BAIRRO: formData.bairro,
      CEP: formData.cep,
      
      // --- DADOS ESPECÍFICOS DO REPRESENTANTE (Verifique se isto está aqui!) ---
      REPRESENTANTE: formData.representante, 
      CPF_DO_REPRESENTANTE: formData.cpf_representante,
      
      // --- DADOS TÉCNICOS ---
      CONCESSIONARIA: formData.concessionaria,
      CONTACONTRATO: formData.contacontrato,
      CLASSIFICACAO: formData.classificacao,
      
      // --- DADOS DO PROCURADOR ---
      NOME_CONTRATADO: formData.nome_CONTRATADO,
      RG_CONTRATADO: formData.rg_CONTRATADO,
      ORGAO_EMISSOR_CONTRATADO: formData.orgao_emissor_CONTRATADO,
      CPF_CONTRATADO: formData.cpf_CONTRATADO,
      ENDERECO_CONTRATADO: formData.endereco_CONTRATADO,

      // --- DATAS ---
      DIA: dataHoje.getDate().toString(),
      MES: meses[dataHoje.getMonth()],
      ANO: dataHoje.getFullYear().toString(),
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) { nextStep(); return; }

    if (!formData.concessionaria) {
      alert("Por favor, selecione uma concessionária.");
      // Opcional: Voltar para a etapa da concessionária se necessário
      if (step !== 1) setStep(1); 
      return;
    }
    
    // Resetando estados
    setReadyToDownload(false);
    setDownloadBlob(null); 
    setTimeLeft(15); 
    setShowAdModal(true); 
    setLoading(true);

    ReactGA.event({ category: "Documento", action: "Clicou Gerar", label: formData.concessionaria });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL; 
      const apiKey = process.env.NEXT_PUBLIC_API_KEY; 

      const payload = prepararPayloadParaAPI();

      const response = await fetch(`${apiUrl}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey || ''
         },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || 'Erro ao gerar documento.');
      }

      const blob = await response.blob();
      setDownloadBlob(blob);

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
    const nomeLimpo = formData.nome.replace(/[^a-zA-Z0-9]/g, "_");
    a.download = `Procuracao_${nomeLimpo}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const jsonLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [{ "@type": "Question", "name": "Gera procuração para CNPJ?", "acceptedAnswer": { "@type": "Answer", "text": "Sim, o sistema identifica automaticamente." } }]
  };

  return (
    <main className="page-wrapper">
      <div className="container form">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <header>
          <h1>Gerador de Procuração Solar</h1>
          <div className="progress-bar">
            <div className={`step ${step >= 0 ? 'active' : ''}`}>1</div>
            <div className="line"></div>
            <div className={`step ${step >= 1 ? 'active' : ''}`}>2</div>
            <div className="line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>3</div>
          </div>
          <h2>{titulosEtapas[step]}</h2>
        </header>

        <form onSubmit={handleSubmit}>
          
          {/* PASSO 1: DADOS CLIENTE (PF ou PJ) */}
          {step === 0 && (
            <div className="step-content">
              <div className="form-group">
                  <label htmlFor="nome">Nome do Cliente / Razão Social</label>
                  <input id="nome" name="nome" value={formData.nome} onChange={handleChange} required autoFocus />
              </div>
              <div className="half form-group">
                <label htmlFor="cpf">CPF / CNPJ</label>
                <input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00 ou CNPJ" maxLength={18} />
              </div>
              <div className="row form-group">
                <div className="half">
                  <label htmlFor="rg">RG / Inscrição Estadual</label>
                  <input id="rg" name="rg" value={formData.rg} onChange={handleChange} placeholder="Opcional se for PJ" maxLength={15} />
                </div>
                <div className="half">
                    <label htmlFor="orgao_emissor">Órgão Emissor</label>
                    <input id="orgao_emissor" name="orgao_emissor" value={formData.orgao_emissor} onChange={handleChange} maxLength={10} style={{textTransform: 'uppercase'}} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="endereco">Endereço Completo</label>
                <input id="endereco" name="endereco" value={formData.endereco} onChange={handleChange} required />
              </div>
              <div className="row form-group">
                  <div className="half"><label htmlFor="bairro">Bairro</label><input id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} required /></div>
                  <div className="half"><label htmlFor="cidade">Cidade</label><input id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} required /></div>
              </div>
              <div className="form-group"><label htmlFor="cep">CEP</label><input id="cep" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" inputMode="numeric" required /></div>
            </div>
          )}

          {/* PASSO 2: CONCESSIONÁRIA E REPRESENTANTE */}
          {step === 1 && (
            <div className="step-content">
              <div className="row form-group">
                <div className="half">
                  <label htmlFor="concessionaria">Concessionária</label>
                  <select id="concessionaria" name="concessionaria" value={formData.concessionaria} onChange={handleChange}>
                    <option value="" >Selecione...</option>
                    <option value="CELPE">CELPE (Neoenergia)</option>
                    <option value="COELBA">COELBA (Neoenergia)</option>
                    <option value="COSERN">COSERN (Neoenergia)</option>
                  </select>
                </div>
                <div className="half">
                  <label htmlFor="classificacao">Classificação</label>
                  <select id="classificacao" name="classificacao" value={formData.classificacao} onChange={handleChange}>
                    <option value="Monofásico">Monofásico</option>
                    <option value="Bifásico">Bifásico</option>
                    <option value="Trifásico">Trifásico</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label htmlFor="contacontrato">Conta Contrato</label><input id="contacontrato" name="contacontrato" value={formData.contacontrato} onChange={handleChange} required inputMode="numeric"/></div>
              
              <div style={{marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'}}>
                <p className="subtitle" style={{fontWeight: 'bold', marginBottom: '10px', color: '#444'}}>Representante Legal (Obrigatório para PJ)</p>
                <div className="form-group"><label htmlFor="representante">Nome do Representante</label><input id="representante" name="representante" value={formData.representante} onChange={handleChange} placeholder="Quem assina pela empresa" style={{color: '#1c1c1c'}}/></div>
                <div className="form-group"><label htmlFor="cpf_representante">CPF do Representante</label><input id="cpf_representante" name="cpf_representante" value={formData.cpf_representante} onChange={handleChange} placeholder="000.000.000-00" style={{color: '#1c1c1c'}}/></div>
              </div>
            </div>
          )}

          {/* PASSO 3: CONTRATADO */}
          {step === 2 && (
            <div className="step-content">
              <div className="form-group"><label htmlFor="nome_CONTRATADO">Nome do Contratado (Outorgado)</label><input id="nome_CONTRATADO" name="nome_CONTRATADO" value={formData.nome_CONTRATADO} onChange={handleChange} required /></div>
              <div className="row form-group">
                  <div className="half"><label htmlFor="rg_CONTRATADO">RG Contratado</label><input id="rg_CONTRATADO" name="rg_CONTRATADO" value={formData.rg_CONTRATADO} onChange={handleChange} required maxLength={15} /></div>
                  <div className="half"><label htmlFor="orgao_emissor_CONTRATADO">Órgão Emissor</label><input id="orgao_emissor_CONTRATADO" name="orgao_emissor_CONTRATADO" value={formData.orgao_emissor_CONTRATADO} onChange={handleChange} style={{textTransform: 'uppercase'}} maxLength={10} /></div>
              </div>
              <div className="form-group"><label htmlFor="cpf_CONTRATADO">CPF Contratado</label><input id="cpf_CONTRATADO" name="cpf_CONTRATADO" value={formData.cpf_CONTRATADO} onChange={handleChange} required maxLength={14} /></div>
              <div className="form-group"><label htmlFor="endereco_CONTRATADO">Endereço Contratado</label><input id="endereco_CONTRATADO" name="endereco_CONTRATADO" value={formData.endereco_CONTRATADO} onChange={handleChange} required/></div>
            </div>
          )}

          <div className="button-group">
            {step > 0 && <button type="button" onClick={prevStep} className="btn-secondary">Voltar</button>}
            {step < 2 ? (
              <button type="button" onClick={nextStep} className="btn-primary">Próximo</button>
            ) : (
              <button type="submit" disabled={loading} className="btn-success">
                {loading ? 'Gerando...' : 'Gerar Documento'}
              </button>
            )}
          </div>
        </form>
      </div>
      
      <ConteudoSite />
      
      {showAdModal && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h3>Preparando Documento...</h3>
                  
                  {timeLeft > 0 ? (
                    <p>Seu download iniciará em <strong>{timeLeft}</strong> segundos.</p>
                  ) : (
                    !readyToDownload ? <p>Finalizando arquivo...</p> : null
                  )}

                  <div className="ad-container" style={{margin: '15px 0'}}><AdSenseBanner /></div>
                  
                  {readyToDownload && (
                    <>
                      <p style={{color: '#10b981', fontWeight: 'bold', fontSize: '1.2em'}}>Download Iniciado!</p>
                      <button onClick={() => setShowAdModal(false)} className="btn-secondary" style={{marginTop: '10px', color: '#1c1c1c'}}>FECHAR</button>
                    </>
                  )}
              </div>
          </div>
      )}
    </main>
  );
}