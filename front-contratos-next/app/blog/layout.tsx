import type { Metadata } from "next";

  
export const metadata: Metadata = {
  title: "Blog Solar | Gerador de Procuração Solar",
  description: "Notícias, guias e dicas sobre homologação e energia solar fotovoltaica.",
  keywords: [
    "blog solar",
    "notícias energia solar",
    "guias energia solar",
  ],
  alternates: {
    canonical: "https://asaweb.tech/blog",
  },
  openGraph: {
    title: "Blog Solar - Asaweb",
    description: "Conteúdos para integradores e profissionais do setor solar.",
    url: "https://asaweb.tech/blog",
    siteName: "Asaweb Tech",
    images: [
      {
        url: "https://asaweb.tech/hero.jpg", // Use a imagem que geramos para o Hero
        width: 1200,
        height: 630,
        alt: "Preview Blog Solar Asaweb",
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