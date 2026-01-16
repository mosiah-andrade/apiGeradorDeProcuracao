"use client";
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [aceitou, setAceitou] = useState(true); // Começa true para não piscar, ajusta no useEffect

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setAceitou(false);
  }, []);

  const aceitar = () => {
    localStorage.setItem('cookie_consent', 'true');
    setAceitou(true);
  };

  if (aceitou) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, 
      background: '#0f172a', color: '#fff', padding: '15px', 
      textAlign: 'center', zIndex: 9999, borderTop: '1px solid #334155'
    }}>
      <p style={{fontSize: '0.9rem', marginBottom: '10px'}}>
        Usamos cookies para melhorar sua experiência e exibir anúncios personalizados.
      </p>
      <button onClick={aceitar} className="btn-primary" style={{padding: '5px 15px', fontSize: '0.8rem'}}>
        Entendi
      </button>
    </div>
  );
}