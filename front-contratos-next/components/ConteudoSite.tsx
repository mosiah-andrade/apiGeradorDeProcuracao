/* src/ConteudoSite.jsx */
import React from 'react';

const ConteudoSite = () => {
  const styles: { [key: string]: React.CSSProperties } = {
    section: {
      color: '#94a3b8',
      marginTop: '60px',
      padding: '20px',
      maxWidth: '800px',
      lineHeight: '1.6',
      textAlign: 'left'
    },
    h3: {
      color: '#e2e8f0',
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.5rem',
      marginTop: '30px',
      marginBottom: '15px',
      borderLeft: '4px solid #059669',
      paddingLeft: '15px'
    },
    p: {
      marginBottom: '15px',
      fontSize: '1rem'
    },
    ul: {
      marginBottom: '20px',
      paddingLeft: '20px'
    }
  };

  return (
    <div style={styles.section}>
      <h3 style={styles.h3}>Sobre o Gerador de Procurações</h3>
      <p style={styles.p}>
        A ferramenta  foi desenvolvida para agilizar o processo de homologação de sistemas fotovoltaicos. 
        Sabemos que preencher procurações manualmente para concessionárias como <strong>Celpe (Neoenergia), Coelba, Cosern e Equatorial</strong> é repetitivo e sujeito a erros.
      </p>

      <h3 style={styles.h3}>O que é uma Procuração?</h3>
      <p style={styles.p}>
        A procuração é um documento legal onde uma pessoa (chamada de <strong>Outorgante</strong>) 
        transfere poderes para outra pessoa (o <strong>Outorgado</strong>) agir em seu nome. 
        É como se você desse uma "permissão oficial" para alguém resolver problemas burocráticos por você.
      </p>
      <p style={styles.p}>
        No contexto da <strong>Energia Solar</strong>, a procuração é obrigatória. Ela serve para que o cliente (dono do imóvel) 
        autorize o integrador ou engenheiro a falar com a concessionária (como a Neoenergia) para pedir a troca do medidor, 
        aprovar o projeto e ligar o sistema fotovoltaico, sem que o cliente precise ir pessoalmente nas agências.
      </p>

      <h3 style={styles.h3}>Como funciona a Homologação?</h3>
      <p style={styles.p}>
        Para dar entrada no projeto de energia solar, o integrador precisa da autorização do cliente. 
        Este documento (Procuração) permite que o engenheiro ou responsável técnico solicite o acesso, 
        troca de titularidade ou vistoria junto à concessionária de energia.
      </p>

      <h3 style={styles.h3}>Vantagens do Sistema</h3>
      <ul style={styles.ul}>
        <li><strong>Padronização:</strong> Modelos atualizados conforme as normas da ANEEL e concessionárias locais.</li>
        <li><strong>Agilidade:</strong> Gere documentos em PDF/Word prontos para assinatura em menos de 1 minuto.</li>
        <li><strong>Segurança:</strong> Seus dados são processados localmente para gerar o contrato.</li>
      </ul>

      <h3 style={styles.h3}>Dúvidas Frequentes</h3>
      <p style={styles.p}>
        <strong>O documento serve para Pessoa Jurídica?</strong><br/>
        Sim. Nossa ferramenta suporta tanto CPF quanto CNPJ. Basta selecionar a opção correspondente no formulário acima.
      </p>
      <p style={styles.p}><strong>É seguro colocar os dados do meu cliente aqui?</strong><br/>
      Sim. O gerador processa as informações localmente no seu navegador e na nossa API segura apenas para montar o arquivo DOCX. Não armazenamos banco de dados com informações pessoais dos seus clientes.</p>

      <p style={styles.p}><strong>O documento é aceito pela Neoenergia?</strong><br/>
      O modelo foi criado seguindo estritamente os padrões exigidos pelas normas da ANEEL e concessionárias do grupo Neoenergia (Celpe, Coelba, Cosern). Porém, sempre confira os dados antes de enviar.</p>

      <p style={styles.p}><strong>Posso editar o arquivo depois de baixar?</strong><br/>
      Sim! O arquivo é gerado em formato Word (.docx), permitindo que você faça qualquer ajuste final ou correção de formatação antes de imprimir.</p>
    
      <h3 style={styles.h3}>Etapas para Homologação de Energia Solar</h3>
        <ol style={{paddingLeft: '20px', marginBottom: '20px'}}>
            <li style={{marginBottom: '10px'}}><strong>Solicitação de Acesso:</strong> O integrador envia o projeto e a procuração assinada pelo cliente.</li>
            <li style={{marginBottom: '10px'}}><strong>Análise da Concessionária:</strong> A distribuidora tem até 15 dias (GD) para emitir o parecer técnico.</li>
            <li style={{marginBottom: '10px'}}><strong>Instalação e Vistoria:</strong> Após a instalação dos painéis, solicita-se a vistoria para troca do medidor.</li>
        </ol>

        <h3 style={styles.h3}>Concessionárias Suportadas</h3>
        <p>Nossa ferramenta gera modelos compatíveis com as principais distribuidoras do Nordeste e do Brasil, incluindo:</p>
        <ul style={{display: 'flex', gap: '15px', flexWrap: 'wrap', listStyle: 'none', padding: 0}}>
            <li style={{background: '#1e293b', padding: '5px 10px', borderRadius: '5px'}}>Neoenergia Pernambuco (Celpe)</li>
            {/* <li style={{background: '#1e293b', padding: '5px 10px', borderRadius: '5px'}}>Neoenergia Bahia (Coelba)</li>
            <li style={{background: '#1e293b', padding: '5px 10px', borderRadius: '5px'}}>Neoenergia Cosern</li>
            <li style={{background: '#1e293b', padding: '5px 10px', borderRadius: '5px'}}>Equatorial Energia</li> */}
        </ul>

    </div>

    
  );
};

export default ConteudoSite;