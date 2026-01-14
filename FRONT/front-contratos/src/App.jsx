import ReactGA from "react-ga4";
import { useState, useEffect } from 'react';
import './App.css';
import ConteudoSite from './ConteudoSite';
import AdSenseBanner from './AdSenseBanner';
import { Helmet, HelmetProvider } from "react-helmet-async";

// --- FUNÇÕES DE FORMATAÇÃO (Ficam fora do componente para melhor performance) ---

const formatarCpfCnpj = (value) => {
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

const formatarCep = (value) => {
  return value
    .replace(/\D/g, '') 
    .slice(0, 8)        
    .replace(/(\d{5})(\d)/, '$1-$2');
};

// Formata RG: Remove símbolos e deixa maiúsculo (Ex: 12.345-67 -> 1234567)
const formatarRG = (value) => {
  return value
    .toUpperCase()              // Letras maiúsculas
    .replace(/[^A-Z0-9]/g, ''); // Remove tudo que NÃO for letra ou número
};

function App() {
  useEffect(() => {
    // Substitua pelo seu ID
    ReactGA.initialize("G-BLV25S4PX9"); 
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  
  // Estados para o Modal de Anúncio
  const [showAdModal, setShowAdModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [readyToDownload, setReadyToDownload] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState(null); 

  const titulosEtapas = ["Dados do Cliente", "Dados da Unidade Consumidora", "Dados do Contratado"];

  const [formData, setFormData] = useState({
    nome: '', cpf: '', rg: '', orgao_emissor: '',
    endereco: '', cidade: '',
    classificacao: 'Monofásico', 
    contacontrato: '', bairro: '', cep: '',
    concessionaria: 'CELPE', representante: '', cpf_representante: '',
    nome_CONTRATADO: '', 
    rg_CONTRATADO: '', 
    orgao_emissor_CONTRATADO: '', 
    cpf_CONTRATADO: '', 
    endereco_CONTRATADO: ''
  });

  // --- HANDLE CHANGE CORRIGIDO ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 1. CPF / CNPJ (aplica em todos os campos 'cpf')
    if (name.includes('cpf')) {
      setFormData(prev => ({ ...prev, [name]: formatarCpfCnpj(value) }));
    } 
    // 2. CEP
    else if (name === 'cep') {
      setFormData(prev => ({ ...prev, [name]: formatarCep(value) }));
    }
    // 3. RG (aplica em 'rg' e 'rg_CONTRATADO')
    else if (name.includes('rg')) {
        setFormData(prev => ({ ...prev, [name]: formatarRG(value) }));
    }
    // 4. Órgão Emissor (aplica em 'orgao'...)
    else if (name.includes('orgao')) {
        // Apenas Uppercase, permite barras (ex: SSP/PE)
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    }
    // 5. Outros campos
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep(c => c + 1);
  const prevStep = () => setStep(c => c - 1);

  // --- Lógica do Contador Regressivo ---
  useEffect(() => {
    let timer = null;
    if (showAdModal && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setReadyToDownload(true);
      if (downloadBlob) {
        baixarArquivoReal(downloadBlob); 
      }
    }
    return () => clearTimeout(timer);
  }, [showAdModal, timeLeft, downloadBlob]);

  // 1. Função que chama a API
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (step < 2) {
      nextStep();
      return; 
    }

    ReactGA.event({
      category: "Documento",
      action: "Clicou Gerar",
      label: formData.concessionaria 
    });
    
    setDownloadBlob(null);
    setTimeLeft(15); 
    
    setShowAdModal(true); 
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gerar-contrato/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao gerar documento');

      const blob = await response.blob();
      setDownloadBlob(blob);

    } catch (error) {
      alert('Erro: ' + error.message);
      setShowAdModal(false); 
    } finally {
      setLoading(false);
    }
  };

  const baixarArquivoReal = (blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Procuracao_${formData.nome.replace(/ /g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <HelmetProvider>
      <div className="page-wrapper">

        <Helmet>
          <title> Gerador de Procurações para Energia Solar</title>
          <meta name="description" content="Gere procurações automáticas para homologação de energia solar nas concessionárias Celpe (Neoenergia), Coelba, Cosern e Equatorial. Rápido, seguro e gratuito para integradores." />
          <meta name="keywords" content="energia solar, homologação, procuração celpe, procuração neoenergia, integrador solar, fotovoltaico, gerar contrato solar" />
          <link rel="canonical" href="https://procuracao.asaweb.tech/" />
          
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Gerador de Documentos" />
          <meta property="og:description" content="Ferramenta gratuita para gerar procurações de homologação solar em segundos." />
          <meta property="og:image" content="https://procuracao.asaweb.tech/imagem-social-share.png" /> 
          <meta property="og:url" content="https://procuracao.asaweb.tech/" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Asaweb.tech" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Gerador de Procuração Solar",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript",
              "url": "https://procuracao.asaweb.tech/",
              "image": "https://procuracao.asaweb.tech/imagem-social-share.png",
              "description": "Ferramenta gratuita para gerar procurações de homologação de energia solar para Celpe, Coelba e outras concessionárias.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BRL",
                "availability": "https://schema.org/InStock"
              },
              "author": {
                "@type": "Organization",
                "name": "Asaweb.tech"
              }
            })}
          </script>
        </Helmet>

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
          {step === 0 && (
            <div className="step-content">
              <div className="form-group">
                  <label>Nome do Cliente / Razão Social</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} required autoFocus />
              </div>
              
              <div className="row">
                  <div className="half">
                    <label>CPF / CNPJ</label>
                    <input 
                      name="cpf" 
                      value={formData.cpf} 
                      onChange={handleChange} 
                      required 
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      maxLength={18}
                    />
                  </div>
                  <div className="half">
                    <label>RG / Inscrição Estadual</label>
                    <input 
                      name="rg" 
                      value={formData.rg} 
                      onChange={handleChange} 
                      placeholder="Somente números/letras"
                      maxLength={15}
                    />
                  </div>
              </div>

              <div className="form-group">
                  <label>Órgão Emissor (Ex: SSP/PE)</label>
                  <input 
                    name="orgao_emissor" 
                    value={formData.orgao_emissor} 
                    onChange={handleChange} 
                    maxLength={10}
                    style={{textTransform: 'uppercase'}} 
                  />
              </div>

              <div className="form-group">
                  <label>Endereço Completo</label>
                  <input name="endereco" value={formData.endereco} onChange={handleChange} />
              </div>
              <div className="row">
                  <div className="half"><label>Bairro</label><input name="bairro" value={formData.bairro} onChange={handleChange} /></div>
                  <div className="half"><label>Cidade</label><input name="cidade" value={formData.cidade} onChange={handleChange} /></div>
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input 
                  name="cep" 
                  value={formData.cep} 
                  onChange={handleChange} 
                  placeholder="00000-000"
                  inputMode="numeric"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="step-content">
              <div className="row">
                <div className="half">
                  <label>Concessionária</label>
                  <select name="concessionaria" value={formData.concessionaria} onChange={handleChange}>
                    <option value="CELPE">CELPE (Neoenergia)</option>
                    <option value="COELBA">COELBA</option>
                    <option value="COSERN">COSERN</option>
                    <option value="EQUATORIAL">EQUATORIAL</option>
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
              
              <hr className="divider"/><p className="subtitle">Representante Legal (Opcional):</p>
              <div className="form-group"><label>Nome</label><input name="representante" value={formData.representante} onChange={handleChange} /></div>
              <div className="form-group"><label>CPF Representante</label><input name="cpf_representante" value={formData.cpf_representante} onChange={handleChange} placeholder="000.000.000-00"/></div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="form-group">
                  <label>Nome do Contratado (Outorgado)</label>
                  <input name="nome_CONTRATADO" value={formData.nome_CONTRATADO} onChange={handleChange} />
              </div>
              
              <div className="row">
                  <div className="half">
                      <label>RG</label>
                      <input 
                          name="rg_CONTRATADO" 
                          value={formData.rg_CONTRATADO} 
                          onChange={handleChange} 
                          required 
                          maxLength={15}
                      />
                  </div>
                  <div className="half">
                      <label>Órgão Emissor</label>
                      <input 
                          name="orgao_emissor_CONTRATADO" 
                          value={formData.orgao_emissor_CONTRATADO} 
                          onChange={handleChange} 
                          style={{textTransform: 'uppercase'}} 
                          maxLength={10}
                          placeholder="Ex: SSP/PE"
                      />
                  </div>
              </div>

              <div className="form-group">
                  <label>CPF do Contratado</label>
                  <input 
                      name="cpf_CONTRATADO" 
                      value={formData.cpf_CONTRATADO} 
                      onChange={handleChange} 
                      required 
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      maxLength={14}
                  />
              </div>

              <div className="form-group">
                  <label>Endereço do Contratado (Outorgado)</label>
                  <input name="endereco_CONTRATADO" value={formData.endereco_CONTRATADO} onChange={handleChange} required/>
              </div>
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

      {showAdModal && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h3>Gerando seu Documento...</h3>
                  <p>Aguarde <strong>{timeLeft}</strong> segundos para o download iniciar.</p>
                  
                  <div className="ad-container">
                      <p style={{fontSize: '0.8rem', color: '#666'}}>Publicidade</p>
                      <div style={{background: 'transparent', width: '100%', height: 'auto', minHeight: '250px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                          <AdSenseBanner />
                      </div>
                  </div>

                  {readyToDownload && (
                      <p style={{color: '#10b981', marginTop: '10px'}}>Download iniciado!</p>
                  )}
                  
                  {readyToDownload && (
                      <button onClick={() => setShowAdModal(false)} className="btn-secondary" style={{marginTop: '15px'}}>Fechar</button>
                  )}
              </div>
          </div>
      )}

      </div>
    </HelmetProvider>
  );
}

export default App;