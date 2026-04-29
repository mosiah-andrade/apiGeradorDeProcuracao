import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import { Toaster } from 'sonner'

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
        <Toaster position="top-right" richColors /> {/* Adicione aqui */}
        {children}
      </body>
    </html>
  );
}
