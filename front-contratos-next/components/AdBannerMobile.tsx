// src/components/AdBannerMobile.tsx
"use client";
import React from 'react';
import GroupAd from './GroupAd';

const AdBannerMobile = ({ adKey = 0 }: { adKey?: number }) => {
  // Define se mostra a rede de anúncios (par) ou o banner do Grupo Parceiro (ímpar)
  const isAdsterraTurn = adKey % 2 === 0;

  // Código HTML limpo e isolado para rodar o Adsterra 320x50 sem conflitos de variáveis globais
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            margin: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 50px; 
            overflow: hidden; 
            background: transparent; 
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '75aef8b36631f0c15104bd81dba5974e',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/75aef8b36631f0c15104bd81dba5974e/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      margin: '20px 0', 
      minHeight: '50px',
      width: '100%' 
    }}>
      {isAdsterraTurn ? (
        /* Renderiza o Adsterra isolado no iframe. Isso resolve o bloqueio de exibição única */
        <>
          <iframe 
            title="Advertisement Mobile"
            srcDoc={iframeContent}
            style={{ width: '320px', height: '50px', border: 'none', overflow: 'hidden' }}
            scrolling="no"
          />
          <p style={{
            backgroundColor: 'lightgray',
            width: '320px',
            textAlign: 'center',
            fontStyle: 'italic',
            color: '#333',
            fontSize: '12px',
            padding: '2px 0',
            borderRadius: '0 0 8px 8px',
            userSelect: 'none'
          }}>
            Anúncio
          </p>
        </>
      ) : (
        /* Renderiza o anúncio do parceiro (GroupAd) na rodada ímpar */
        <GroupAd />
      )}
    </div>
  );
};

export default AdBannerMobile;