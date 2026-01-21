// app/blog/[slug]/page.tsx
import { client } from "@/app/lib/sanity";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";

// 1. Geração estática (Obrigatório para output: export)
export async function generateStaticParams() {
  const query = `*[_type == "post"]{ "slug": slug.current }`;
  const posts = await client.fetch(query);
  return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}

// 2. Atualizamos a query para trazer TODOS os campos (Imagem, Autor, Categorias)
async function getPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    body,
    "imageUrl": mainImage.asset->url,   // Pega a URL da imagem de capa
    "imageAlt": mainImage.alt,          // Pega o texto alternativo da imagem
    "author": author->name,             // Pega o nome do autor referenciado
    "categories": categories[]->title   // Pega a lista de títulos das categorias
  }`;
  
  return await client.fetch(query, { slug });
}

// 3. Componente da Página
export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params; // Next.js 15 requer await nos params
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="page-wrapper">
      <div className="container container-wide">
        <header style={{ textAlign: 'left', border: 'none' }}>
          <Link href="/blog" className="btn-link">← Voltar para o Blog</Link>
          
          {/* Categorias (se existirem) */}
          {post.categories && (
             <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
               {post.categories.map((cat: string, index: number) => (
                 <span key={index} className="blog-category">{cat}</span>
               ))}
             </div>
          )}

          <h1 style={{ marginTop: '15px', fontSize: '2.5rem' }}>{post.title}</h1>
          
          {/* Data e Autor */}
          <div style={{ display: 'flex', gap: '20px', color: '#94a3b8', fontSize: '0.9rem', marginTop: '10px', fontStyle: 'italic' }}>
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : "Data não disponível"}</span>
            {post.author && <span>• Por {post.author}</span>}
          </div>
        </header>

        <div className="divider"></div>

        {/* --- CAPA PRINCIPAL --- */}
        {post.imageUrl && (
          <div style={{ marginBottom: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--borda-fina)' }}>
            <img 
              src={post.imageUrl} 
              alt={post.imageAlt || post.title} 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '500px' }} 
            />
          </div>
        )}

        {/* Conteúdo do Artigo */}
        <article className="post-content" style={{ lineHeight: '1.8', color: 'var(--texto-corpo)', fontSize: '1.1rem' }}>
          <PortableText value={post.body} />
        </article>
      </div>
    </div>
  );
}