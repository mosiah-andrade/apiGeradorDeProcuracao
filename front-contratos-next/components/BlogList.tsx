'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Vamos tentar importar usando o alias '@/' que vai direto para a raiz do projeto
// Se der erro de caminho, mude para '../lib/sanity' ou '../../lib/sanity'
import { urlFor } from '../app/lib/sanity'; // Ajuste o caminho conforme sua estrutura

export default function BlogList({ posts }: { posts: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // BLINDAGEM: Verifica se 'posts' é realmente um Array.
  // Se for null, undefined ou um Objeto estranho, usa um array vazio [].
  const safePosts = Array.isArray(posts) ? posts : [];

  const filteredPosts = safePosts.filter((post) => {
    // Verificação de segurança para posts sem título
    if (!post || !post.title) return false; 
    
    return post.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      {/* --- Área da Barra de Pesquisa --- */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <input
          type="text"
          placeholder="Buscar artigos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px 20px',
            fontSize: '1rem',
            borderRadius: '50px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            outline: 'none',
            transition: 'all 0.2s',
            color: '#334155',
          }}
        />
      </div>

      {/* --- Grid de Posts (Filtrado) --- */}
      {filteredPosts.length > 0 ? (
        <div className="blog-grid">
          {filteredPosts.map((post: any) => (
            <Link
              href={`/blog/${post.slug.current}`}
              key={post._id}
              className="blog-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {post.mainImage && (
                <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                  <Image
                    // Aqui usamos o urlFor importado corretamente
                    src={urlFor(post.mainImage).url()}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {post.categories && post.categories.length > 0 && (
                  <div>
                    <span className="blog-category">{post.categories[0].title}</span>
                  </div>
                )}
                <h3 style={{ fontSize: '1.2rem', margin: '10px 0', lineHeight: '1.4' }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '20px', flex: 1 }}>
                  {post.body?.[0]?.children?.[0]?.text?.substring(0, 100)}...
                </p>

                <div className="blog-footer">
                  <span className="blog-date">
                    {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span style={{ color: 'var(--verde-main)', fontWeight: 700, fontSize: '0.9rem' }}>
                    Ler Mais &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>Nenhum artigo encontrado para "{searchTerm}".</p>
        </div>
      )}
    </>
  );
}