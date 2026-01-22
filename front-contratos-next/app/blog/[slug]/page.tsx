import { PortableText } from '@portabletext/react';
import { getPost, getPosts } from '../../lib/posts'; // Ajuste o caminho se necessário
import { urlFor } from '../../lib/sanity';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';

// 1. GERAÇÃO ESTÁTICA DAS PÁGINAS (OBRIGATÓRIO NA HOSTINGER)
export async function generateStaticParams() {
  const posts = await getPosts(); // Busca todos os posts
  return posts.map((post: any) => ({
    slug: post.slug.current, // Gera uma página para cada slug
  }));
}

// 2. TIPO DOS PARÂMETROS
type Props = {
  params: Promise<{ slug: string }>; // Params agora é uma Promise no Next.js 15
};

// 3. PÁGINA DO POST
export default async function PostPage({ params }: Props) {
  // Await nos params antes de usar (Regra nova do Next.js 15)
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="" style={{maxWidth: '80%', padding: '20px', margin: '0 auto'}}  >
      <Link href="/blog" className="btn-link" style={{marginBottom: '20px', display:'inline-block'}}>
        &larr; Voltar para o Blog
      </Link>

      <article className="blog-content" style={{margin: '0 auto'}}>
        {post.mainImage && (
          <div style={{ position: 'relative', width: '100%', height: '400px', marginBottom: '30px', borderRadius: '8px', overflow: 'hidden' }}>
            <Image
              src={urlFor(post.mainImage).url()}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}

        <header style={{marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px'}}>
          <h1 style={{fontSize: '2.5rem', marginBottom: '10px'}}>{post.title}</h1>
          <div style={{display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9rem'}}>
            <span>Por: {post.author?.name || 'Redação'}</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </header>

        <div className="conteudo-site" >
          <PortableText value={post.body} />
        </div>

        <ShareButtons 
          title={post.title} 
          url={`https://asaweb.tech/blog/${resolvedParams.slug}`} 
        />
      </article>
    </div>
  );
}