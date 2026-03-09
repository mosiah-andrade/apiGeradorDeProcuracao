import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculadora Solar Pro - Análise Técnica e Viabilidade Financeira",
  description: "Ferramenta avançada para análise técnica e avaliação financeira de projetos de energia solar.",
  keywords: [
    "calculadora solar",
    "análise técnica",
    "viabilidade financeira",
    "energia solar",
    "projeto solar"
  ],
  alternates: {
    canonical: "https://asaweb.tech/declaracao-posse",
  },
  openGraph: {
    title: "Calculadora Solar Pro - Asaweb",
    description: "Análise detalhada e avaliação financeira para projetos solares.",
    url: "https://asaweb.tech/calculadora-solar",
    siteName: "Asaweb Tech",
    images: [
      {
        url: "https://asaweb.tech/hero-solar.png", // Use a imagem que geramos para o Hero
        width: 1200,
        height: 630,
        alt: "Preview Calculadora Solar Pro",
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