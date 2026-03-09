import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerador de Declaração de Posse de Imóvel - Grátis | Asaweb",
  description: "Crie sua declaração de posse de imóvel online de forma rápida para solicitar novo padrão de energia ou comprovar residência junto à Neoenergia/Celpe.",
  keywords: [
    "declaração de posse", 
    "posse de imóvel", 
    "modelo declaração de posse", 
    "neoenergia", 
    "celpe", 
    "gerador de documentos"
  ],
  alternates: {
    canonical: "https://asaweb.tech/declaracao-posse",
  },
  openGraph: {
    title: "Gerador de Declaração de Posse - Asaweb",
    description: "Gere seu documento PDF/DOCX em poucos segundos de forma gratuita.",
    url: "https://asaweb.tech/declaracao-posse",
    siteName: "Asaweb Tech",
    images: [
      {
        url: "https://asaweb.tech/hero-posse.png", // Use a imagem que geramos para o Hero
        width: 1200,
        height: 630,
        alt: "Preview Gerador de Declaração de Posse",
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

export default function DeclaracaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}