import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerador de Procurações para Energia Solar",
  description: "Ferramenta para gerar procurações de energia solar fotovoltaica para concessionárias.",
  keywords: ["energia solar", "homologação", "procuração celpe", "integrador solar"],
  authors: [{ name: "Asaweb.tech" }],
  openGraph: {
    title: "Gerador de Procuração Solar",
    description: "Rápido, seguro e gratuito para integradores.",
    url: "https://procuracao.asaweb.tech/",
    siteName: "Gerador Solar",
    images: [
      {
        url: "/imagem-social-share.png", // Caminho relativo à pasta public
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        {children}
        
        {/* Script do Google AdSense Carregado Manualmente e Otimizado */}
        <Script
          id="adsense-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6246941190460663"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}