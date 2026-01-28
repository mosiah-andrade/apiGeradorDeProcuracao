import { PortableText } from '@portabletext/react';
import { getPost, getPosts } from '../../lib/posts';
import { urlFor } from '../../lib/sanity';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';
import { Metadata } from 'next'; // 1. ADICIONEI ESTA IMPORTAÇÃO
import GroupAd from '@/components/GroupAd';

// GERAÇÃO ESTÁTICA DAS PÁGINAS
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post: any) => ({
    slug: post.slug.current,
  }));
}

// TIPO DOS PARÂMETROS
type Props = {
  params: Promise<{ slug: string }>;
};

const ptComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div style={{ margin: '30px 0', width: '100%' }}>
          {/* Usando Next/Image para otimização */}
          <Image
            src={urlFor(value).url()}
            alt={value.alt || 'Imagem do artigo'}
            width={800}
            height={500}
            style={{
              display: 'flex',
              margin: '0 auto',
              width: '60%',
              height: 'auto', // Mantém a proporção original
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          {/* Se quiser mostrar legenda, adicione aqui */}
          {value.caption && (
            <p style={{textAlign: 'center', color: '#666', fontSize: '0.9rem', marginTop: '5px'}}>
              {value.caption}
            </p>
          )}
        </div>
      );
    }
  }
};
// -------------------------------------------------------------

// 2. FUNÇÃO NOVA: ISSO É O QUE MUDA O TÍTULO DA ABA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    return {
      title: 'Artigo não encontrado | Asa Web',
    };
  }

  return {
    // Aqui definimos o título que aparece na aba do navegador e no Google
    title: `${post.title} | Asa Web`,
    // A descrição é crucial para o SEO (o texto cinza que aparece abaixo do link no Google)
    description: post.excerpt || `Leia o artigo completo sobre ${post.title} no blog da Asa Web.`,
    
    // Bônus: Isso faz o link ficar bonito quando compartilhado no WhatsApp/LinkedIn
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.mainImage ? [urlFor(post.mainImage).url()] : [],
    },
  };
}

// PÁGINA DO POST (SEU CÓDIGO ORIGINAL)
export default async function PostPage({ params }: Props) {
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
          <PortableText value={post.body} components={ptComponents} />
        </div>

        {post.related && post.related.length > 0 && (
        <div style={{ marginTop: '80px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
            Você também pode gostar
          </h3>

          <div className="blog-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {post.related.map((relatedPost: any) => (
              <Link 
                href={`/blog/${relatedPost.slug.current}`} 
                key={relatedPost._id}
                style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}
              >
                {/* Imagem do Card */}
                {relatedPost.mainImage && (
                  <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                    <Image
                      src={urlFor(relatedPost.mainImage).url()}
                      alt={relatedPost.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                
                {/* Texto do Card */}
                <div style={{ padding: '15px' }}>
                   {relatedPost.categories?.[0] && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--verde-main)', fontWeight: 'bold' }}>
                        {relatedPost.categories[0].title}
                      </span>
                   )}
                   <h4 style={{ margin: '10px 0', fontSize: '1rem' }}>{relatedPost.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
        <div style={{ marginTop: '50px', marginBottom: '30px', textAlign: 'center' }}>
            <p style={{marginBottom: '15px', fontSize: '0.95rem', color: '#475569'}}>
                Quer tirar dúvidas técnicas com outros integradores? <br />
                <strong>Confira o grupo VIP do nosso parceiro:</strong>
            </p>
            <GroupAd />
        </div>

        <ShareButtons 
          title={post.title} 
          url={`https://asaweb.tech/blog/${resolvedParams.slug}`} 
        />
      </article>
    </div>
  );
}