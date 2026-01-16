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
    </div>
  );
};

export default ConteudoSite;