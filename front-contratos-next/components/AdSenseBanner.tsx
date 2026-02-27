// src/AdSenseBanner.tsx
"use client";
import React, { useEffect, useRef } from 'react';

const AdSenseBanner = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && adRef.current) {
          // Limpa o container para evitar anúncios duplicados em re-renders
          adRef.current.innerHTML = '';

          // --- OPÇÃO 1: ADSTERRA SIMPLIFICADO (Ativo) ---
          const script = document.createElement('script');
          script.src = "https://pl28807824.effectivegatecpm.com/6884d9994893fc4e4dc7fcbefa9e2832/invoke.js";
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          adRef.current.appendChild(script);

          // --- OPÇÃO 3: GOOGLE ADSENSE (Comentado) ---
          /* if ((window as any).adsbygoogle) {
              (window as any).adsbygoogle.push({});
          } 
          */
        }
      } catch (e: any) {
        console.log("Aviso de Ads:", e.message);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 auto',
        width: '100%',
    }}>
      {/* CONTAINER PRINCIPAL: O ID deve bater com o script ativo (Adsterra) */}
      <div 
        ref={adRef} 
        id="container-6884d9994893fc4e4dc7fcbefa9e2832" 
        style={{ width: '100%', minHeight: '250px', textAlign: 'center' }}
      >
        {/* O Adsterra injetara o iframe aqui */}
      </div>

      {/* --- BLOCO ADSENSE ORIGINAL (Comentado) --- */}
      {/* <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%', minWidth: '300px' }}
           data-ad-client="ca-pub-6246941190460663" 
           data-ad-slot="2899879434"
           data-ad-format="auto"
           data-full-width-responsive="true"
           data-ad-test="on"
      ></ins> 
      */}

      {/* --- BANNER INTERNO WHATSAPP (Comentado) --- */}
      {/* <img 
        src={'/adsDev.png'} 
        alt="Anúncio" 
        onClick={() => window.open('https://wa.me/558189289155?text=Olá...', '_blank')}  
        className="w-full h-full max-w-[700px]" 
        style={{ display: 'block', cursor: 'pointer', marginTop: '10px' }} 
      /> 
      */}

      {/* Rótulo clicável para Captação de Leads (WhatsApp) */}
      <p style={{
          backgroundColor: 'lightgray',
          width: '100%',
          textAlign: 'center',
          fontStyle: 'italic',
          color: '#333',
          fontSize: '12px',
          padding: '4px 0',
          borderRadius: '0 0 8px 8px',
          cursor: 'pointer', 
          userSelect: 'none'
        }} onClick={() => window.open('https://wa.me/558189289155?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20desenvolvimento%20de%20sites%20para%20Energia%20Solar!', '_blank')}>
        Anuncio
      </p>
    </div>
  );
};

export default AdSenseBanner;