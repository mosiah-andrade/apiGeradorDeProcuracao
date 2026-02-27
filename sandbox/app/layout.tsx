import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css"; // <--- VERIFIQUE SE ESTA LINHA EXISTE
import CookieBanner from "@/components/CookieBanner";
import { Playfair_Display, Inter, Lato } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';

// Configuração das fontes otimizadas pelo Next.js
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair'
});

const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter'
});

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://asaweb.tech'),
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
        url: "https://asaweb.tech/imagem-social-share.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="pt-BR" 
      className={`${playfair.variable} ${inter.variable} ${lato.variable}`}
    >
      <head>
        <GoogleAnalytics gaId="G-BLV25S4PX9" />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
