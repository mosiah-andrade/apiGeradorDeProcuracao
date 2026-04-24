import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: "Quem Somos - Asaweb Tech",
    description: "Conheça a equipe apaixonada por tecnologia e inovação da Asaweb Tech. Descubra nossa missão, visão e valores que nos impulsionam a criar soluções de alta qualidade para nossos clientes.",
    keywords: [
        "quem somos",
        "equipe asaweb",
        "missão asaweb",
        "visão asaweb",
        "valores asaweb",
        "sobre nós asaweb",
        "tecnologia asaweb",
        "inovação asaweb",
        "soluções asaweb",
        "história asaweb",
        "cultura asaweb",
        "carreiras asaweb",
        "contato asaweb"
    ],
    alternates: {
        canonical: "https://asaweb.tech/quem-somos",
    },
    openGraph: {
        title: "Quem Somos - Asaweb Tech",
        description: "Conheça a equipe apaixonada por tecnologia e inovação da Asaweb Tech. Descubra nossa missão, visão e valores que nos impulsionam a criar soluções de alta qualidade para nossos clientes.",
        url: "https://asaweb.tech/quem-somos",
        siteName: "Asaweb Tech",
        images: [
            {
                url: "https://asaweb.tech/hero-quem-somos.png", // Use a imagem que geramos para o Hero
                width: 1200,
                height: 630,
                alt: "Equipe Asaweb Tech - Quem Somos",
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

export default function QuemSomosLayout({
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