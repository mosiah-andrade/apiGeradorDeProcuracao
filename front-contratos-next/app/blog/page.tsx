import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '../lib/posts';
import { urlFor } from '../lib/sanity';

// Força a página a ser estática
export const dynamic = 'force-static';

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="">
      <header style={{textAlign: 'center', marginBottom: '50px', paddingTop: '30px'}}>
        <h1>Blog Solar</h1>
        <p style={{fontSize: '1.2rem', color: '#64748b'}}>Notícias e dicas sobre homologação e energia solar.</p>
      </header>

      <div className="blog-grid">
        {posts.map((post: any) => (
          <Link href={`/blog/${post.slug.current}`} key={post._id} className="blog-card" style={{textDecoration: 'none', color: 'inherit'}}>
            {post.mainImage && (
              <div style={{position: 'relative', width: '100%', height: '200px'}}>
                <Image
                  src={urlFor(post.mainImage).url()}
                  alt={post.title}
                  fill
                  style={{objectFit: 'cover'}}
                />
              </div>
            )}
            <div style={{padding: '20px', display: 'flex', flexDirection: 'column', flex: 1}}>
              {post.categories && post.categories.length > 0 && (
                <div>
                   <span className="blog-category">{post.categories[0].title}</span>
                </div>
              )}
              <h3 style={{fontSize: '1.2rem', margin: '10px 0', lineHeight: '1.4'}}>{post.title}</h3>
              <p style={{fontSize: '0.95rem', color: '#64748b', marginBottom: '20px', flex: 1}}>
                {post.body?.[0]?.children?.[0]?.text?.substring(0, 100)}...
              </p>
              
              <div className="blog-footer">
                <span className="blog-date">
                  {new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span style={{color: 'var(--verde-main)', fontWeight: 700, fontSize: '0.9rem'}}>Ler Mais &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}