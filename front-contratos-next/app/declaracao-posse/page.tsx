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
    municipio: ''
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
      Município: formData.municipio,
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

    ReactGA.event({ category: "Documento", action: "Gerar Posse", label: formData.municipio });

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Nome do Proprietário/Possuidor</label>
          <input type="text" name="proprietario" value={formData.proprietario} onChange={handleChange} className="w-full p-2 border rounded text-black" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CPF</label>
          <input type="text" name="cpf_proprietario" value={formData.cpf_proprietario} onChange={handleChange} className="w-full p-2 border rounded text-black" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">RG</label>
          <input type="text" name="rg_proprietario" value={formData.rg_proprietario} onChange={handleChange} className="w-full p-2 border rounded text-black" required />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Endereço Completo do Imóvel</label>
          <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} className="w-full p-2 border rounded text-black" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Início da Permanência (Mês/Ano)</label>
          <input type="text" name="inicio_permanencia" value={formData.inicio_permanencia} onChange={handleChange} className="w-full p-2 border rounded text-black" placeholder="Ex: Janeiro de 2015" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Município/UF</label>
          <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} className="w-full p-2 border rounded text-black" required />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Motivo da Declaração</label>
          <input type="text" name="motivo" value={formData.motivo} onChange={handleChange} className="w-full p-2 border rounded text-black" placeholder="Ex: solicitação de novo padrão de energia" required />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors mt-4">
        {loading ? 'Gerando Documento...' : 'Gerar Declaração Agora'}
      </button>
    </form>
  );

  return (
    <main className="page-wrapper">
      <section className="hero w-full min-h-[80vh] py-12 flex flex-col justify-center items-center text-center md:flex-row md:justify-end md:items-center md:text-left md:pr-[150px]" 
        style={{ backgroundImage: "url('/hero-posse.png')", color: '#fff', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        
        <div className="max-h-fit max-w-[500px] w-[90vw]" style={{ backgroundColor: 'rgba(17, 24, 39, 0.93)', padding: '30px', borderRadius: '12px' }}>
          <h1 className="text-2xl font-bold mb-3 text-white">Gerador de Declaração de Posse</h1>
          <p className="text-gray-300 mb-6 text-sm">Crie sua declaração de posse de imóvel de forma rápida e gratuita para fins de comprovação.</p>
          
          <button type="button" className="btn-primary w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold" onClick={() => setShowFormModal(true)}>
            Preencher Formulário
          </button>
        </div>
      </section>

      <section className="content-section max-w-4xl mx-auto my-12 px-4">
        <h2 className="text-xl font-bold mb-4">O que é a Declaração de Posse?</h2>
        <p className="text-gray-700 mb-4">A Declaração de Posse é um documento utilizado para comprovar que uma pessoa é possuidora ou proprietária de um imóvel, mesmo que não seja o titular do registro. Ela é frequentemente exigida em situações onde o indivíduo precisa demonstrar sua relação com o imóvel, como em processos de regularização fundiária, solicitação de serviços públicos, ou para fins legais e administrativos.</p>
        <p className="text-gray-700 mb-4">Este documento pode ser essencial para garantir direitos relacionados ao imóvel, como acesso a serviços básicos, participação em programas sociais, ou até mesmo para resolver questões de vizinhança. A declaração deve conter informações detalhadas sobre o imóvel, o possuidor e a natureza da posse, além de ser assinada e datada para ter validade legal.</p>
      </section>
      <div className="content-section max-w-4xl mx-auto " >
        <AdSenseBanner />
      </div>
      <section className="content-section max-w-4xl mx-auto my-12 px-4">
        <h2 className="text-xl font-bold mb-4">Como Funciona o Gerador de Declaração de Posse?</h2>
        <p className="text-gray-700 mb-4">Nosso gerador de Declaração de Posse é uma ferramenta online que permite criar um documento personalizado de forma rápida e fácil. Basta preencher um formulário com as informações solicitadas, como nome do proprietário, CPF, RG, endereço do imóvel, início da permanência, motivo da declaração e município. Após o envio, o sistema processará os dados e gerará um arquivo em formato Word (.docx) que pode ser baixado imediatamente.</p>
        <p className="text-gray-700 mb-4">O processo é simples e intuitivo, projetado para atender às necessidades de quem precisa comprovar a posse de um imóvel sem complicações. Além disso, o serviço é gratuito, garantindo que todos tenham acesso a essa importante ferramenta de documentaçãoção.</p>
      </section>
      <section className="content-section max-w-4xl ">
        <h2 className="text-xl font-bold mb-4">Quem Pode Utilizar o Gerador de Declaração de Posse?</h2>
        <p className="text-gray-700 mb-4">O gerador de Declaração de Posse é destinado a qualquer pessoa que precise comprovar a posse ou propriedade de um imóvel. Isso inclui moradores, arrendatários, ocupantes, ou qualquer indivíduo que tenha uma relação de posse com um imóvel e precise formalizar essa relação para fins legais, administrativos ou pessoais.</p>
        <p className="text-gray-700 mb-4">Se você está enfrentando dificuldades para comprovar sua relação com um imóvel, seja para acessar serviços públicos, participar de programas sociais, ou resolver questões legais, nosso gerador pode ser a solução ideal para criar um documento válido e personalizado de forma rápida e gratuita.</p>
      </section>
      <div className="content-section max-w-4xl mx-auto " >
        <AdSenseBanner />
      </div>
      <section className="content-section max-w-4xl mx-auto my-12 px-4">
        <h2 className="text-xl font-bold mb-4">Vantagens de Usar Nosso Gerador de Declaração de Posse</h2>
        <p className="text-gray-700 mb-4">Utilizar nosso gerador de Declaração de Posse oferece diversas vantagens, como a praticidade de criar um documento personalizado em poucos minutos, sem a necessidade de conhecimentos técnicos ou jurídicos. O processo é totalmente online e gratuito, permitindo que qualquer pessoa tenha acesso a essa importante ferramenta de documentação.</p>
        <p className="text-gray-700 mb-4">Além disso, o documento gerado é formatado profissionalmente e pode ser utilizado para diversos fins, como comprovação de residência, regularização fundiária, ou para resolver questões legais relacionadas ao imóvel. Com nosso gerador, você tem a segurança de criar um documento válido e personalizado, atendendo às suas necessidades específicas.</p>
      </section>    
      <section className="content-section max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Dúvidas Frequentes</h2>
        <p className="text-gray-700 mb-4"><strong>1. O documento gerado é válido legalmente?</strong><br />Sim, a Declaração de Posse gerada por nossa ferramenta é formatada de acordo com os padrões legais e pode ser utilizada para comprovar a posse ou propriedade de um imóvel em diversas situações.</p>
        <p className="text-gray-700 mb-4"><strong>2. Posso usar o documento para regularização fundiária?</strong><br />Sim, a Declaração de Posse pode ser utilizada como parte da documentação necessária para processos de regularização fundiária, dependendo dos requisitos específicos do órgão responsável.</p>
        <p className="text-gray-700 mb-4"><strong>3. O serviço é realmente gratuito?</strong><br />Sim, nosso gerador de Declaração de Posse é totalmente gratuito, permitindo que qualquer pessoa possa criar um documento personalizado sem custos.</p>
        <p className="text-gray-700 mb-4"><strong>4. Quanto tempo leva para gerar o documento?</strong><br />O processo de geração do documento é rápido e geralmente leva apenas alguns segundos após o envio do formulário, dependendo da velocidade da conexão com a internet.</p>
        <p className="text-gray-700 mb-4"><strong>5. Posso editar o documento após baixá-lo?</strong><br />Sim, o arquivo gerado é em formato Word (.docx), permitindo que você faça edições adicionais utilizando um editor de texto compatível, caso necessário.</p>
      </section>
       <div className="content-section max-w-4xl mx-auto " >
        <AdSenseBanner />
      </div>
      

      <DownloadModal isOpen={showAdModal} timeLeft={timeLeft} readyToDownload={readyToDownload} onClose={() => setShowAdModal(false)} adKey={adKey} />

      {showFormModal && (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFormModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Dados da Declaração</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>
            {renderForm()}
          </div>
        </div>
      )}
    </main>
  );
}