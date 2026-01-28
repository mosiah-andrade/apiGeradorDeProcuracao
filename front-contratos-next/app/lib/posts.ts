// app/lib/posts.ts
import { client } from "./sanity";

// Função para buscar TODOS os posts (mantive igual)
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

// app/lib/posts.ts

export async function getPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    mainImage,
    author->{name},
    body,
    
    // Trazemos as categorias expandidas para o post principal
    categories[]->{
      _id,
      title
    },

    // --- CORREÇÃO NA LÓGICA DE RELACIONADOS ---
    // 1. count(...) > 0: Conta se existe pelo menos uma coincidência
    // 2. categories[@._ref in ^.categories[]._ref]: Verifica se as categorias (_ref) 
    //    do post candidato estão presentes na lista de categorias do post pai (^)
    // 3. defined(categories): Garante que o post candidato tem categorias
    "related": *[
      _type == "post" && 
      slug.current != ^.slug.current && 
      defined(categories) &&
      count(categories[@._ref in ^.categories[]._ref]) > 0
    ] | order(publishedAt desc)[0...3]{
      _id,
      title,
      slug,
      publishedAt,
      mainImage,
      categories[]->{title}
    }
  }`;
  
  return await client.fetch(query, { slug });
}
  