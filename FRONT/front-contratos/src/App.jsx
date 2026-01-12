import { useState, useEffect } from 'react';
import './App.css';
import ConteudoSite from './ConteudoSite'; // Importa o texto de SEO
import AdSenseBanner from './AdSenseBanner';
import { Helmet, HelmetProvider } from "react-helmet-async";

function App() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  
  // Estados para o Modal de Anúncio
  const [showAdModal, setShowAdModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [readyToDownload, setReadyToDownload] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState(null); // Guarda o arquivo temporariamente

  const titulosEtapas = ["Dados do Cliente", "Dados da Unidade Consumidora", "Dados do Contratado"];

  const [formData, setFormData] = useState({
    nome: '', cpf: '', endereco: '', cidade: '',
    classificacao: '', contacontrato: '', bairro: '', cep: '',
    concessionaria: 'CELPE', representante: '', cpf_representante: '',
    nome_CONTRATADO: '', rg_CONTRATADO: '', cpf_CONTRATADO: '', endereco_CONTRATADO: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
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
        baixarArquivoReal(downloadBlob); // Baixa automático quando zera
      }
    }
    return () => clearTimeout(timer);
  }, [showAdModal, timeLeft, downloadBlob]);

  // 1. Função que chama a API
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // --- TRAVA DE SEGURANÇA ---
    // Se o usuário apertar ENTER nas etapas 0 ou 1, apenas avança para o próximo passo.
    if (step < 2) {
      nextStep();
      return; // PARA AQUI! Não abre modal, não envia para o Python.
    }
    
    // Se chegou aqui, estamos na última etapa.
    setDownloadBlob(null);
    setTimeLeft(15); // Reinicia o contador
    
    // 1. Abre o modal IMEDIATAMENTE (Feedback visual para o usuário)
    setShowAdModal(true); 
    setLoading(true);

    try {
      // 2. Chama o Python em segundo plano enquanto o anúncio roda
      const response = await fetch(`${import.meta.env.VITE_API_URL}/gerar-contrato/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao gerar documento');

      const blob = await response.blob();
      
      // 3. Guarda o arquivo. O useEffect vai baixar automaticamente quando o tempo acabar.
      setDownloadBlob(blob);

    } catch (error) {
      alert('Erro: ' + error.message);
      setShowAdModal(false); // Fecha o modal se der erro no Python
    } finally {
      setLoading(false);
    }
  };

  // 2. Função que realmente baixa o arquivo
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
          
          {/* Tags para Redes Sociais (Open Graph / Facebook / WhatsApp) */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Gerador de Documentos" />
          <meta property="og:description" content="Ferramenta gratuita para gerar procurações de homologação solar em segundos." />
          <meta property="og:image" content="https://procuracao.asaweb.tech/imagem-social-share.png" /> 
          <meta property="og:url" content="https://procuracao.asaweb.tech/" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Asaweb.tech" />
          {/* Schema.org - Dados Estruturados para Ferramentas Web */}
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
          {/* ... SEUS CAMPOS DO FORMULÁRIO (MANTIVE IGUAL) ... */}
          
          {step === 0 && (
            <div className="step-content">
              <div className="form-group">
                  <label>Nome do Cliente</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} required autoFocus />
              </div>
              <div className="form-group">
                  <label>CPF / CNPJ</label>
                  <input name="cpf" value={formData.cpf} onChange={handleChange} required />
              </div>
              <div className="form-group">
                  <label>Endereço Completo</label>
                  <input name="endereco" value={formData.endereco} onChange={handleChange} />
              </div>
              <div className="row">
                  <div className="half"><label>Bairro</label><input name="bairro" value={formData.bairro} onChange={handleChange} /></div>
                  <div className="half"><label>Cidade</label><input name="cidade" value={formData.cidade} onChange={handleChange} /></div>
              </div>
              <div className="form-group"><label>CEP</label><input name="cep" value={formData.cep} onChange={handleChange} /></div>
            </div>
          )}

          {step === 1 && (
            <div className="step-content">
              <div className="row">
                <div className="half">
                  <label>Concessionária</label>
                  <select name="concessionaria" value={formData.concessionaria} onChange={handleChange}>
                    <option value="CELPE">CELPE</option>
                    {/* <option value="COELBA">COELBA</option>
                    <option value="COSERN">COSERN</option>
                    <option value="EQUATORIAL">EQUATORIAL</option>
                    <option value="TESTE">TESTE</option> */}
                  </select>
                </div>
                <div className="form-group"><label>Classificação</label><input name="classificacao" value={formData.classificacao} onChange={handleChange} required/></div>
              </div>
              <div className="form-group"><label>Conta Contrato</label><input name="contacontrato" value={formData.contacontrato} onChange={handleChange} required/></div>
              <hr className="divider"/><p className="subtitle">Representante Legal (Opcional):</p>
              <div className="form-group"><label>Nome</label><input name="representante" value={formData.representante} onChange={handleChange} /></div>
              <div className="form-group"><label>CPF</label><input name="cpf_representante" value={formData.cpf_representante} onChange={handleChange} /></div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="form-group"><label>Nome do Contratado</label><input name="nome_CONTRATADO" value={formData.nome_CONTRATADO} onChange={handleChange} /></div>
              <div className="row">
                  <div className="half"><label>RG</label><input name="rg_CONTRATADO" value={formData.rg_CONTRATADO} onChange={handleChange} required /></div>
                  <div className="half"><label>CPF</label><input name="cpf_CONTRATADO" value={formData.cpf_CONTRATADO} onChange={handleChange} required /></div>
              </div>
              <div className="form-group"><label>Endereço do Contratado</label><input name="endereco_CONTRATADO" value={formData.endereco_CONTRATADO} onChange={handleChange} required/></div>
            </div>
          )}

          {/* BOTÕES */}
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

      {/* TEXTO DE SEO PARA ADSENSE */}
      <ConteudoSite />

      {/* --- MODAL DE ANÚNCIO (POPUP) --- */}
      {showAdModal && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h3>Gerando seu Documento...</h3>
                  <p>Aguarde <strong>{timeLeft}</strong> segundos para o download iniciar.</p>
                  
                  {/* --- ÁREA DO ANÚNCIO --- */}
                  <div className="ad-container">
                      <p style={{fontSize: '0.8rem', color: '#666'}}>Publicidade</p>
                      {/* AQUI VOCÊ VAI COLAR O CÓDIGO DO ADSENSE DEPOIS */}
                      <div style={{background: '#eee', width: '100%', height: '250px', display:'flex', alignItems:'center', justifyContent:'center', color: '#333'}}>
                          <AdSenseBanner />
                      </div>
                  </div>
                  {/* ----------------------- */}

                  {readyToDownload && (
                      <p style={{color: '#10b981', marginTop: '10px'}}>Download iniciado!</p>
                  )}
                  
                  {/* Botão para fechar só aparece depois do tempo */}
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