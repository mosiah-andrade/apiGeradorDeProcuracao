import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import { Toaster } from 'sonner'
import Link from 'next/link';
import { GoogleAnalytics } from '@next/third-parties/google';
import ToastHandler from "./components/ToastHandler";
import { Suspense } from 'react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "gerador de proposta comercial - asaweb",
  description: "Gerador de Propostas Comerciais para equipe de vendas e engenheiros no ramo de energia solar - Asaweb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <Toaster 
          position="top-center" 
          richColors 
          closeButton 
          expand={true} 
          theme="light" 
        />
        <Suspense>
          <ToastHandler />
        </Suspense>
        {children}
        <footer className="py-8 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Asaweb.tech. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/termos" className="hover:text-blue-600">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-blue-600">Política de Privacidade</Link>
            <Link href="https://wa.me/558189289155" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Contato</Link>
          </div>
        </footer>
        <GoogleAnalytics gaId="G-BLV25S4PX9" />
      </body>
    </html>
  );
}
