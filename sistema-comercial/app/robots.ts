import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Substitua pelo domínio real de produção do seu sistema comercial
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ' https://app.asaweb.tech/';

  return {
    rules: {
      userAgent: '*',
      // Permitir indexar a página inicial e as landing pages públicas
      allow: ['/', '/lp', '/lp2', '/termos', '/privacidade'],
      // Bloquear completamente a indexação de painéis, fluxos e administração
      disallow: [
        '/admin/',
        '/proposta/',
        '/perfil/',
        '/planos/',
        '/auth/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}