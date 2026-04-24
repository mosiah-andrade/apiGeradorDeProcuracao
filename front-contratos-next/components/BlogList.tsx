'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '../app/lib/sanity'; // Ajuste o caminho conforme sua estrutura

export default function BlogList({ posts }: { posts: any[] }) {
  // 1. Estados para a Busca e para a Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const CARDS_POR_PAGINA = 8; // Limite máximo na tela

  // BLINDAGEM: Verifica se 'posts' é realmente um Array.
  const safePosts = Array.isArray(posts) ? posts : [];

  // 2. Filtra os posts baseado na busca
  const filteredPosts = safePosts.filter((post) => {
    if (!post || !post.title) return false; 
    return post.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 3. Lógica de Paginação (Fatia o array de posts filtrados)
  const totalPaginas = Math.ceil(filteredPosts.length / CARDS_POR_PAGINA);
  const indiceInicial = (paginaAtual - 1) * CARDS_POR_PAGINA;
  const indiceFinal = indiceInicial + CARDS_POR_PAGINA;
  
  // Array final que vai de fato aparecer na tela
  const postsDaPagina = filteredPosts.slice(indiceInicial, indiceFinal);

  // 4. Função que lida com a digitação (E reseta a página para 1)
  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPaginaAtual(1); // Se o usuário pesquisar algo, sempre volta pra primeira página
  };

  return (
    <>
      {/* --- Área da Barra de Pesquisa --- */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <input
          type="text"
          placeholder="Buscar artigos..."
          value={searchTerm}
          onChange={handleBusca}
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

      {/* --- Grid de Posts (Renderiza os posts fatiados) --- */}
      {postsDaPagina.length > 0 ? (
        <div className="blog-grid">
          {postsDaPagina.map((post: any) => (
            <Link
              href={`/blog/${post.slug.current}`}
              key={post._id}
              className="blog-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {post.mainImage && (
                <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                  <Image
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
                  <span style={{ color: 'var(--verde-main, #22c55e)', fontWeight: 700, fontSize: '0.9rem' }}>
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

      {/* --- Controles de Paginação --- */}
      {totalPaginas > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '20px', 
          marginTop: '50px' 
        }}>
          <button
            onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaAtual === 1}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              maxWidth: '200px',
              backgroundColor: paginaAtual === 1 ? '#e2e8f0' : 'var(--verde-main, #22c55e)',
              color: paginaAtual === 1 ? '#94a3b8' : '#fff',
              cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            &larr; Anterior
          </button>

          <span style={{ color: '#475569', fontWeight: '500' }}>
            Página {paginaAtual} de {totalPaginas}
          </span>

          <button
            onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaAtual === totalPaginas}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              maxWidth: '200px',
              border: 'none',
              backgroundColor: paginaAtual === totalPaginas ? '#e2e8f0' : 'var(--verde-main, #22c55e)',
              color: paginaAtual === totalPaginas ? '#94a3b8' : '#fff',
              cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            Próxima &rarr;
          </button>
        </div>
      )}
    </>
  );
}