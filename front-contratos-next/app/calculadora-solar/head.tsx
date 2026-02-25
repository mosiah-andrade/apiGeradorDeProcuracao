import React from 'react';

export default function Head() {
  return (
    <>
      <title>Calculadora Solar Pro | Gerador de Procuração Solar</title>
      <meta name="description" content="Calculadora Solar Pro — análise técnica e viabilidade financeira para projetos fotovoltaicos." />

      {/* Open Graph */}
      <meta property="og:title" content="Calculadora Solar Pro" />
      <meta property="og:description" content="Análise técnica detalhada e avaliação financeira para projetos de energia solar." />
      <meta property="og:image" content="https://asaweb.tech/imagem-social-share.png" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Calculadora Solar Pro" />
      <meta name="twitter:description" content="Análise técnica e viabilidade financeira para projetos fotovoltaicos." />
      <meta name="twitter:image" content="https://asaweb.tech/imagem-social-share.png" />
    </>
  );
}
