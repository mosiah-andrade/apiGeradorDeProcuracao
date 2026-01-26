import { MetadataRoute } from 'next';
import { client } from './lib/sanity'; // Importa sua configuração do Sanity

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://asaweb.tech';

  // 1. Busca todos os posts no Sanity
  // Pega o slug e a data de atualização (_updatedAt)
  const query = `*[_type == "post"]{ "slug": slug.current, _updatedAt }`;
  const posts = await client.fetch(query);

  // 2. Mapeia os posts para o formato do sitemap
  const blogUrls = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 3. Define as rotas estáticas (Home, etc)
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 4. Junta tudo
  return [...staticRoutes, ...blogUrls];
}