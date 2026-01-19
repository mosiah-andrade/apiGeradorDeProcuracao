import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import { Playfair_Display, Inter } from 'next/font/google'

// Configure as fontes
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap', // Importante para performance
  variable: '--font-playfair'
})

const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: "Gerador de Procurações para Energia Solar",
  description: "Ferramenta para gerar procurações de energia solar fotovoltaica para concessionárias.",
  keywords: ["energia solar", "homologação", "procuração celpe", "integrador solar"],
  authors: [{ name: "Asaweb.tech" }],
  openGraph: {
    title: "Gerador de Procuração Solar",
    description: "Rápido, seguro e gratuito para integradores.",
    url: "https://asaweb.tech/",
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
    <html lang="pt-br" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <CookieBanner />
        {/* Script do Google AdSense Carregado Manualmente e Otimizado */}
        <Script
          id="adsense-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6246941190460663"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}