"use client"; // Esse componente roda no navegador

import React, { useState, useEffect } from 'react';
import BannerAnuncio  from './BannerAnuncio';
import { adsData,  AnuncioType  } from './adsdata';

export default function AdManager() {
  const [anunciosSorteados, setAnunciosSorteados] = useState<AnuncioType[]>([]);

  useEffect(() => {
    const copiaDosAnuncios = [...adsData];
    const listaEmbaralhada = copiaDosAnuncios.sort(() => 0.5 - Math.random());
    setAnunciosSorteados(listaEmbaralhada);
  }, []);

  return (
    <div className="flex flex-col gap-8 my-8">
      {/* Exibe quantos anúncios você quiser aqui, passando índices diferentes */}
      {anunciosSorteados[0] && <BannerAnuncio anuncio={anunciosSorteados[0]} />}
    </div>
  );
}