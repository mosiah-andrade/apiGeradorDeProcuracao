// src/AdSenseBanner.jsx
"use client";
import React, { useEffect, useRef } from 'react';

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
      } catch (e: any) {
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
    <div className="max-h-[80vh]" style={{ 
        overflow: 'hidden', 
        // minHeight: '250px', 
        minWidth: '300px', 
        // background: '#f1f1f1', // Cor de fundo para não ficar buraco negro
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
        width: '100%',
        
        
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
      <img src={'/adsDev.png'} alt="Anúncio" onClick={() => window.open('https://wa.me/558189289155?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20desenvolvimento%20de%20sites%20para%20Energia%20Solar!', '_blank')}  className="w-full h-full max-w-[700px]" style={{
          display: 'block',
          cursor: 'pointer', // Cursor de mão para indicar que é clicável
        }} /> 
        <p className="w-auto max-w-[700px]" style={{
          backgroundColor: 'lightgray',
          width: '100%',
          textAlign: 'center',
          marginTop: '0px',
          fontStyle: 'italic',
          color: '#333',
          fontSize: '12px',
          padding: '4px 0',
          borderRadius: '0 0 8px 8px',
          userSelect: 'none',
          cursor: 'pointer', 
        }} onClick={() => window.open('https://wa.me/558189289155?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20desenvolvimento%20de%20sites%20para%20Energia%20Solar!', '_blank') 
        }>Anuncio</p>


    </div>
  );
};

export default AdSenseBanner;