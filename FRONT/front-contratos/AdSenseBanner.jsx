import React, { useEffect } from 'react';

const AdSenseBanner = () => {

  useEffect(() => {
    try {
      // Tenta empurrar o anúncio para o Google renderizar
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erro no AdSense:", e);
    }
  }, []);

  return (
    <div style={{ overflow: 'hidden', minHeight: '250px' }}>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-6246941190460663" 
           data-ad-slot="2899879434"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
};

export default AdSenseBanner;