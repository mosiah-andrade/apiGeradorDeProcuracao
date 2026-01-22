// app/lib/posts.ts
import { client } from "./sanity";

// Função para buscar TODOS os posts (para a Home do Blog)
export async function getPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    categories[]->{title},
    body
  }`;
  
  return await client.fetch(query);
}

// Função para buscar UM post específico pelo Slug (para a página do Post)
export async function getPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    mainImage,
    author->{name},
    body
  }`;
  
  return await client.fetch(query, { slug });
}