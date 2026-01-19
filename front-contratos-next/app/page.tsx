"use client"; // Necessário para usar useState/useEffect

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ReactGA from "react-ga4";
import ConteudoSite from '../components/ConteudoSite';
import AdSenseBanner from '../components/AdSenseBanner';

// --- Tipagem dos Dados ---
interface FormData {
  nome: string;
  cpf: string;
  rg: string;
  orgao_emissor: string;
  endereco: string;
  cidade: string;
  classificacao: string;
  contacontrato: string;
  bairro: string;
  cep: string;
  concessionaria: string;
  representante: string;
  cpf_representante: string;
  nome_CONTRATADO: string;
  rg_CONTRATADO: string;
  orgao_emissor_CONTRATADO: string;
  cpf_CONTRATADO: string;
  endereco_CONTRATADO: string;
  [key: string]: string; // Assinatura de índice para permitir acesso dinâmico
}

// --- FUNÇÕES DE FORMATAÇÃO ---
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
    concessionaria: 'CELPE', representante: '', cpf_representante: '',
    nome_CONTRATADO: '', rg_CONTRATADO: '', orgao_emissor_CONTRATADO: '',
    cpf_CONTRATADO: '', endereco_CONTRATADO: ''
  });

  useEffect(() => {
    ReactGA.initialize("G-BLV25S4PX9");
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  // Lógica do Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAdModal && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && showAdModal) {
      setReadyToDownload(true);
      if (downloadBlob) baixarArquivoReal(downloadBlob);
    }
    return () => clearTimeout(timer);
  }, [showAdModal, timeLeft, downloadBlob]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      nextStep();
      return;
    }

    ReactGA.event({ category: "Documento", action: "Clicou Gerar", label: formData.concessionaria });
    
    setDownloadBlob(null);
    setTimeLeft(15);
    setShowAdModal(true);
    setLoading(true);

    try {
      // IMPORTANTE: Configure NEXT_PUBLIC_API_URL no seu .env.local
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://www.asaweb.tech/api/index.php";
      
      const response = await fetch(`${apiUrl}/gerar-contrato/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao gerar documento');
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
    a.download = `Procuracao_${formData.nome.replace(/ /g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <header>
          <h1>Procuração</h1>
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
          {/* --- PASSO 1 --- */}
          {step === 0 && (
            <div className="step-content">
              <div className="form-group">
                  <label>Nome do Cliente / Razão Social</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} required autoFocus />
              </div>
              <div className="half form-group">
                <label>CPF / CNPJ</label>
                <input name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" maxLength={18} />
              </div>
              <div className="row form-group">
                <div className="half">
                  <label>RG / Inscrição Estadual</label>
                  <input name="rg" value={formData.rg} onChange={handleChange} placeholder="Somente números/letras" maxLength={15} />
                </div>
                <div className="half">
                    <label>Órgão Emissor</label>
                    <input name="orgao_emissor" value={formData.orgao_emissor} onChange={handleChange} maxLength={10} style={{textTransform: 'uppercase'}} />
                </div>
              </div>
              <div className="form-group"><label>Endereço Completo</label><input name="endereco" value={formData.endereco} onChange={handleChange} /></div>
              <div className="row form-group">
                  <div className="half"><label>Bairro</label><input name="bairro" value={formData.bairro} onChange={handleChange} /></div>
                  <div className="half"><label>Cidade</label><input name="cidade" value={formData.cidade} onChange={handleChange} /></div>
              </div>
              <div className="form-group"><label>CEP</label><input name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" inputMode="numeric" /></div>
            </div>
          )}

          {/* --- PASSO 2 --- */}
          {step === 1 && (
            <div className="step-content">
              <div className="row form-group">
                <div className="half">
                  <label>Concessionária</label>
                  <select name="concessionaria" value={formData.concessionaria} onChange={handleChange}>
                    <option value="CELPE">CELPE (Neoenergia)</option>
                  </select>
                </div>
                <div className="half">
                  <label>Classificação</label>
                  <select name="classificacao" value={formData.classificacao} onChange={handleChange}>
                    <option value="Monofásico">Monofásico</option>
                    <option value="Bifásico">Bifásico</option>
                    <option value="Trifásico">Trifásico</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Conta Contrato</label><input name="contacontrato" value={formData.contacontrato} onChange={handleChange} required inputMode="numeric"/></div>
              <p className="subtitle">Representante Legal (Opcional):</p>
              <div className="form-group"><label>Nome</label><input name="representante" value={formData.representante} onChange={handleChange} /></div>
              <div className="form-group"><label>CPF Representante</label><input name="cpf_representante" value={formData.cpf_representante} onChange={handleChange} placeholder="000.000.000-00"/></div>
            </div>
          )}

          {/* --- PASSO 3 --- */}
          {step === 2 && (
            <div className="step-content">
              <div className="form-group"><label>Nome do Contratado (Outorgado)</label><input name="nome_CONTRATADO" value={formData.nome_CONTRATADO} onChange={handleChange} /></div>
              <div className="row form-group">
                  <div className="half"><label>RG</label><input name="rg_CONTRATADO" value={formData.rg_CONTRATADO} onChange={handleChange} required placeholder="Somente números/letras" maxLength={15} /></div>
                  <div className="half"><label>Órgão Emissor</label><input name="orgao_emissor_CONTRATADO" value={formData.orgao_emissor_CONTRATADO} onChange={handleChange} style={{textTransform: 'uppercase'}} maxLength={10} /></div>
              </div>
              <div className="form-group"><label>CPF do Contratado</label><input name="cpf_CONTRATADO" value={formData.cpf_CONTRATADO} onChange={handleChange} required placeholder="000.000.000-00" maxLength={14} /></div>
              <div className="form-group"><label>Endereço do Contratado</label><input name="endereco_CONTRATADO" value={formData.endereco_CONTRATADO} onChange={handleChange} required/></div>
            </div>
          )}

          <div className="button-group">
            {step > 0 && <button type="button" onClick={prevStep} className="btn-secondary">Voltar</button>}
            {step < 2 ? (
              <button type="button" onClick={nextStep} className="btn-primary">Próximo</button>
            ) : (
              <button type="submit" disabled={loading} className="btn-success">
                {loading ? 'Processando...' : 'Gerar Documento'}
              </button>
            )}
          </div>
        </form>
      </div>

      <ConteudoSite />

      <p className="footer-note">© 2026 AsaWeb Tech. Todos os direitos reservados. <a href="/politica-de-privacidade">Política de Privacidade</a></p>
      {showAdModal && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h3>Gerando seu Documento...</h3>
                  <p>Aguarde <strong>{timeLeft}</strong> segundos para o download iniciar.</p>
                  
                  <div className="ad-container">
                      <AdSenseBanner />
                  </div>

                  {readyToDownload && <p style={{color: '#10b981', marginTop: '10px'}}>Download iniciado!</p>}
                  {readyToDownload && <button onClick={() => setShowAdModal(false)} className="btn-secondary" style={{marginTop: '15px'}}>Fechar</button>}
              </div>
          </div>
      )}
    </div>
  );
}