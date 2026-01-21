// app/blog/page.tsx
import { client } from "@/app/lib/sanity";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Solar - Notícias e Dicas",
  description: "Fique por dentro das novidades do mercado de energia solar.",
};

// Interface atualizada com os novos campos
interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  imageUrl?: string;      // Campo opcional para imagem
  author?: string;        // Campo opcional para autor
  category?: string;      // Campo opcional para a primeira categoria
}

// Query atualizada para buscar Imagem, Autor e Categoria
async function getPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    "excerpt": array::join(string::split((pt::text(body)), "")[0..150], "") + "...",
    "imageUrl": mainImage.asset->url,
    "author": author->name,
    "category": categories[0]->title
  }`;
  
  return await client.fetch<SanityPost[]>(query);
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="page-wrapper">
        <header>
          <h1>Blog Solar</h1>
          <h2>Últimas Notícias</h2>
        </header>

        <div className="blog-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post._id} className="blog-card" style={{ padding: 0, overflow: 'hidden' }}>
                
                {/* --- IMAGEM DE CAPA NO CARD --- */}
                {post.imageUrl && (
                  <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
                  
                  {/* Categoria acima do título */}
                  {post.category && (
                    <span className="blog-category" style={{ alignSelf: 'flex-start', color: 'var(--verde-main)' }}>
                      {post.category}
                    </span>
                  )}

                  <h3 style={{ marginTop: '10px', color: 'var(--bg-page)' }}>{post.title}</h3>
                  
                  <p style={{ fontSize: '0.95rem', color: 'var(--bg-page)' }}>
                    {post.excerpt || "Sem resumo disponível."}
                  </p>
                  
                  <div className="blog-footer" style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span className="blog-date">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : ""}
                      </span>
                      {post.author && <span>por {post.author}</span>}
                    </div>

                    <Link href={`/blog/${post.slug.current}`} className="btn-link" style={{ color: 'var(--verde-main)' }}>
                      Ler mais →
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div style={{ textAlign: "center", width: "100%", padding: "40px" }}>
              <p>Nenhum artigo encontrado.</p>
              <small>Certifique-se de que publicou os posts no Sanity Studio.</small>
            </div>
          )}
      </div>
    </div>
  );
}