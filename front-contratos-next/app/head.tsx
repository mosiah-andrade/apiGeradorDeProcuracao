import React from 'react';

export default function Head() {
  return (
    <>
      <title>Gerador de Procurações para Energia Solar | Asaweb</title>
      <meta name="description" content="Ferramenta para gerar procurações de energia solar fotovoltaica para concessionárias." />

      {/* Open Graph */}
      <meta property="og:title" content="Gerador de Procuração Solar" />
      <meta property="og:description" content="Rápido, seguro e gratuito para integradores." />
      <meta property="og:image" content="https://asaweb.tech/imagem-social-share.png" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Gerador de Procuração Solar" />
      <meta name="twitter:description" content="Rápido, seguro e gratuito para integradores." />
      <meta name="twitter:image" content="https://asaweb.tech/imagem-social-share.png" />
    </>
  );
}
