// src/AdSenseBanner.jsx
import React, { useEffect, useRef } from 'react';
import anuncio from '/imagem-social-share.png';

const AdSenseBanner = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // TEMPORIZADOR: Espera 500ms (meio segundo) para o Modal abrir totalmente
    // Isso evita o erro "availableWidth=0"
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
            // Empurra o anúncio para o Google processar
            window.adsbygoogle.push({});
        }
      } catch (e) {
        // Ignora o erro "All 'ins' elements..." que acontece no React em desenvolvimento
        console.log("Aviso do AdSense (Normal em dev):", e.message);
      }
    }, 500); 

    // Limpa o timer se o usuário fechar o modal antes de carregar
    return () => clearTimeout(timer);
  }, []);

  return (
    // ESTILO DE SEGURANÇA:
    // min-width e min-height garantem que o espaço exista mesmo antes do anúncio chegar
    <div style={{ 
        overflow: 'hidden', 
        // minHeight: '250px', 
        minWidth: '300px', 
        // background: '#f1f1f1', // Cor de fundo para não ficar buraco negro
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
        width: '100%',
        height: 'auto'
        
        
    }}>
      {/* <ins className="adsbygoogle"
           ref={adRef} 
           style={{ display: 'block', width: '100%', minWidth: '300px' }}
           data-ad-client="ca-pub-6246941190460663" 
           data-ad-slot="2899879434"
           data-ad-format="auto"
           data-full-width-responsive="true"
           data-ad-test="on"
          >
           </ins> */}
      <img src={anuncio} alt="Anúncio" style={{ 
          maxWidth: '100%', 
          height: 'auto', 
          display: 'block' 
        }} />
    </div>
  );
};

export default AdSenseBanner;