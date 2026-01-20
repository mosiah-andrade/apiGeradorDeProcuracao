import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
// 1. Importamos a Lato aqui também
import { Playfair_Display, Inter, Lato } from 'next/font/google'

// Configuração otimizada das fontes (Next.js baixa e injeta no build)
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair'
})

const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter'
})

// 2. Configuração da Lato (pesos usados no seu CSS: 300, 400, 700)
const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato'
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
        url: "/imagem-social-share.png",
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
    // 3. Adicionamos a variável da Lato na classe do HTML
    <html lang="pt-br" className={`${inter.variable} ${playfair.variable} ${lato.variable}`}>
      <body>
        {children}
        <CookieBanner />
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