"use client";

import React from 'react';
// Importamos a interface do arquivo de dados para não duplicar
import { AnuncioType } from './adsdata'; 

// O componente agora recebe apenas UM anúncio pronto do AdManager
interface BannerAnuncioProps {
  anuncio: AnuncioType | null; 
}

export default function BannerAnuncio({ anuncio }: BannerAnuncioProps) {
  
  // Se ainda não tiver anúncio, mostra o fundo cinza carregando
  if (!anuncio) {
    return <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg"></div>;
  }

  const handleAdClick = () => {
    // 1. Verifica se estamos no navegador (evita erros no servidor)
    // 2. Verifica se a função global do Google Analytics (gtag) está carregada
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      
      // 3. Dispara o evento personalizado para o GA4
      (window as any).gtag('event', 'click_anuncio', {
        event_category: 'Anuncios', // Categoria do evento
        event_label: anuncio.adKey, // AQUI VAI QUAL ANÚNCIO FOI CLICADO (Ex: ad_promo_inverno)
        link_destino: anuncio.link  // (Opcional) Envia para onde o usuário foi levado
      });
      
      console.log(`Analytics: Clique registrado para o anúncio ${anuncio.adKey}`);
    }
  };

  // Renderiza o anúncio na tela
  return (
    <div>
      <a 
        href={anuncio.link} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleAdClick}
      >
        <img 
          src={anuncio.imagem} 
          alt={`Anúncio: ${anuncio.adKey}`} 
          className="w-full h-auto rounded-lg shadow-md hover:opacity-90 transition-opacity" 
        />
      </a>
    </div>
  );
}