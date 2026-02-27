// src/components/AdBannerMobile.tsx
"use client";
import React, { useEffect, useRef } from 'react';

const AdBannerMobile = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && adRef.current && adRef.current.innerHTML === '') {
          // 1. Configura as opções específicas do banner 320x50
          (window as any).atOptions = {
            'key' : '75aef8b36631f0c15104bd81dba5974e',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };

          // 2. Injeta o script de execução
          const script = document.createElement('script');
          script.src = "https://www.highperformanceformat.com/75aef8b36631f0c15104bd81dba5974e/invoke.js";
          script.async = true;
          adRef.current.appendChild(script);
        }
      } catch (e: any) {
        console.log("Aviso de Banner Mobile:", e.message);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (adRef.current) adRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      margin: '20px 0', 
      minHeight: '50px',
      width: '100%' 
    }}>
      <div ref={adRef} id="container-75aef8b36631f0c15104bd81dba5974e" />
    </div>
  );
};

export default AdBannerMobile;