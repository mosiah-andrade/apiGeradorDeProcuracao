import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css"; // <--- VERIFIQUE SE ESTA LINHA EXISTE
import CookieBanner from "@/components/CookieBanner";
import { Playfair_Display, Inter, Lato } from 'next/font/google';
import Navbar from "@/components/Navbar";
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
    icon: 'https://asaweb.tech/favicon.ico', 
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
    <html lang="pt-br" className={`${inter.variable} ${playfair.variable} ${lato.variable}`}>
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main className="page-wrapper">
          {children}
        </main>

        <CookieBanner />
        <p className="footer-note">© {new Date().getFullYear()} AsaWeb Tech. Todos os direitos reservados. <a href="/politica-de-privacidade" style={{color: '#007bff'}}>Política de Privacidade</a></p>
        <Script
          id="adsense-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6246941190460663"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <GoogleAnalytics gaId="G-BLV25S4PX9" />
      </body>
    </html>
  );
}