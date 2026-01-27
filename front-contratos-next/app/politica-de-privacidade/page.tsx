import React from 'react';

export const metadata = { 
  title: "Política de Privacidade | Gerador de Procuração Solar",
  description: "Política de privacidade e tratamento de dados conforme a LGPD e diretrizes do Google AdSense."
};

export default function PoliticaPrivacidade() {
  return (
    <div className="container" style={{padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333'}}>
      <h1 style={{fontSize: '2.5rem', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Política de Privacidade</h1>
      <p style={{fontStyle: 'italic', color: '#666', marginBottom: '30px'}}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <section style={{marginBottom: '30px'}}>
        <p>
          O <strong>Gerador de Procuração Solar (Asaweb)</strong> preza pela segurança e privacidade de seus usuários. 
          Esta Política de Privacidade tem como objetivo esclarecer como coletamos, usamos e protegemos as informações inseridas em nossa ferramenta, 
          em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong> e as políticas de publicidade do <strong>Google AdSense</strong>.
        </p>
      </section>

      <section style={{marginBottom: '30px'}}>
        <h2 style={{fontSize: '1.5rem', color: '#2c3e50', marginBottom: '15px'}}>1. Coleta e Uso de Dados</h2>
        <p>
          Para fornecer o serviço de geração automática de procurações e documentos, nossa ferramenta solicita os seguintes dados pessoais:
        </p>
        <ul style={{listStyleType: 'disc', marginLeft: '20px', marginBottom: '15px'}}>
          <li><strong>Dados de Identificação:</strong> Nome completo, CPF, RG, Órgão Emissor.</li>
          <li><strong>Dados de Contato e Localização:</strong> Endereço completo (Rua, Bairro, Cidade, CEP).</li>
          <li><strong>Dados Técnicos:</strong> Conta contrato de energia e concessionária.</li>
        </ul>
        <p>
          <strong>Finalidade Única:</strong> Esses dados são utilizados <strong>exclusivamente</strong> para o preenchimento automático do modelo de documento (.docx) solicitado pelo usuário.
        </p>
        <div style={{backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #4caf50', marginTop: '15px'}}>
          <strong>Importante:</strong> Nós <strong>NÃO</strong> armazenamos, vendemos ou compartilhamos os dados pessoais inseridos no formulário em bancos de dados permanentes. 
          As informações são processadas de forma transitória apenas para a criação do arquivo e descartadas após o download.
        </div>
      </section>

      <section style={{marginBottom: '30px'}}>
        <h2 style={{fontSize: '1.5rem', color: '#2c3e50', marginBottom: '15px'}}>2. Cookies e Publicidade (Google AdSense)</h2>
        <p>
          Este site utiliza serviços de publicidade de terceiros, especificamente o <strong>Google AdSense</strong>, para exibir anúncios quando você visita nosso site.
        </p>
        <ul style={{listStyleType: 'disc', marginLeft: '20px'}}>
          <li>
            <strong>Cookies DART:</strong> O Google, como fornecedor terceirizado, utiliza cookies para exibir anúncios. O uso do cookie DART permite que o Google e seus parceiros 
            exibam anúncios para nossos usuários com base em sua visita ao nosso site e/ou a outros sites na Internet.
          </li>
          <li>
            <strong>Desativação:</strong> Os usuários podem optar por desativar o uso do cookie DART visitando a 
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{color: '#0070f3', textDecoration: 'underline'}}> Política de Privacidade da rede de conteúdo e anúncios do Google</a>.
          </li>
        </ul>
      </section>

      <section style={{marginBottom: '30px'}}>
        <h2 style={{fontSize: '1.5rem', color: '#2c3e50', marginBottom: '15px'}}>3. Seus Direitos (LGPD)</h2>
        <p>
          Como titular dos dados, você tem o direito garantido pela LGPD de:
        </p>
        <ul style={{listStyleType: 'disc', marginLeft: '20px'}}>
          <li>Confirmar a existência de tratamento de dados;</li>
          <li>Acessar seus dados (neste caso, como não armazenamos, não mantemos histórico);</li>
          <li>Solicitar a correção de dados incompletos ou inexatos;</li>
          <li>Revogar consentimento a qualquer momento.</li>
        </ul>
      </section>

      <section style={{marginBottom: '30px'}}>
        <h2 style={{fontSize: '1.5rem', color: '#2c3e50', marginBottom: '15px'}}>4. Segurança</h2>
        <p>
          Adotamos medidas técnicas de segurança para proteger o trânsito das informações entre seu navegador e nossa API (uso de protocolo HTTPS/SSL). 
          No entanto, lembre-se de que nenhum método de transmissão pela Internet é 100% seguro.
        </p>
      </section>

      <section style={{marginBottom: '30px'}}>
        <h2 style={{fontSize: '1.5rem', color: '#2c3e50', marginBottom: '15px'}}>5. Links para Terceiros</h2>
        <p>
          Nosso site pode conter links para sites externos (como concessionárias de energia ou parceiros afiliados) que não são operados por nós. 
          Recomendamos fortemente que você reveja a Política de Privacidade de cada site que visita. Não temos controle e não assumimos responsabilidade pelo conteúdo ou práticas de sites de terceiros.
        </p>
      </section>

      <section style={{marginBottom: '30px'}}>
        <h2 style={{fontSize: '1.5rem', color: '#2c3e50', marginBottom: '15px'}}>6. Contato</h2>
        <p>
          Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como lidamos com os dados (Controlador), entre em contato conosco:
        </p>
        <p style={{marginTop: '10px'}}>
          <strong>E-mail:</strong> contato@asaweb.tech<br />
          <strong>Responsável Técnico:</strong> Asaweb Tecnologia [Substituir por Razão Social se houver]
        </p>
      </section>
    </div>
  );
}