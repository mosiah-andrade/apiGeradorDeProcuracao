import { MetadataRoute } from 'next';
import { client } from './lib/sanity';

// --- ADICIONE ESTA LINHA ---
export const dynamic = 'force-static'; 
// Isso avisa ao Next.js: "Gere este arquivo no build e não mude mais."

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://asaweb.tech';

  // 1. Busca todos os posts no Sanity
  const query = `*[_type == "post"]{ "slug": slug.current, _updatedAt }`;
  const posts = await client.fetch(query);

  // 2. Mapeia os posts
  const blogUrls = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 3. Rotas estáticas
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

  return [...staticRoutes, ...blogUrls];
}