// app/blog/[slug]/page.tsx
import { client } from "@/app/lib/sanity";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButtons from "@/components/ShareButtons"; // Certifique-se que importou

// 1. Gera as páginas estáticas
export async function generateStaticParams() {
  const query = `*[_type == "post"]{ "slug": slug.current }`;
  const posts = await client.fetch(query);

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

// 2. Busca o post no Sanity
async function getPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    body,
    "imageUrl": mainImage.asset->url,
    "imageAlt": mainImage.alt,
    "author": author->name,
    "categories": categories[]->title
  }`;
  
  return await client.fetch(query, { slug });
}

// 3. Componente da Página (CORRIGIDO)
// Note a tipagem 'Promise' nos params para Next.js 16
export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  
  // AQUI ESTÁ A CORREÇÃO:
  // Precisamos "esperar" (await) os params para pegar o slug
  const params = await props.params; 
  const slug = params.slug; 

  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="page-wrapper blog-content">
        <header style={{ textAlign: 'left', border: 'none' }}>
          <Link href="/blog" className="btn-link" style={{color: 'var(--verde-main)'}}>← Voltar para o Blog</Link>
          
          {post.categories && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
               {post.categories.map((cat: string, index: number) => (
                 <span key={index} className="blog-category">{cat}</span>
                ))}
             </div>
          )}

          <h1 style={{ marginTop: '15px', fontSize: '2.5rem' }}>{post.title}</h1>
          
          <div style={{ display: 'flex', gap: '20px', color: '#5a6068', fontSize: '0.9rem', marginTop: '10px', fontStyle: 'italic' }}>
            <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : ""}</span>
            {post.author && <span>• Por {post.author}</span>}
          </div>
          <ShareButtons title={post.title} url={slug} />
        </header>

        <div className="divider"></div>

        {post.imageUrl && (
          <div style={{ marginBottom: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--borda-fina)' }}>
            <img 
              src={post.imageUrl} 
              alt={post.imageAlt || post.title} 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '500px' }} 
            />
          </div>
        )}

        <article className="post-content" style={{ lineHeight: '1.8', color: 'var(--texto-corpo)', fontSize: '1.1rem' }}>
          <PortableText value={post.body} />
        </article>


    </div>
  );
}