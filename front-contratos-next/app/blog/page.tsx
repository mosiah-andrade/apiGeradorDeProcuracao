import { getPosts } from '../lib/posts';
import BlogList from '../../components/BlogList';

export const dynamic = 'force-static';

export default async function BlogPage() {
  // Busca os dados no servidor (Sanity)
  const posts = await getPosts();

  // Se o getPosts falhar, garantimos um array vazio
  const safePosts = posts || [];

  return (
    // 1. Tag <main> para semântica correta de SEO e fundo levemente cinza para destacar os cards
    <main className="min-h-screen  pt-16 pb-24">
      
      {/* 2. Hero Section (Cabeçalho) com largura máxima controlada */}
      <header className="max-w-3xl mx-auto px-4 text-center mb-16">
        {/* Título com destaque na palavra "Solar" */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Blog <span className="text-green-600">Solar</span>
        </h1>
        
        {/* Subtítulo com linha de altura (leading) relaxada para melhor leitura */}
        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
          Notícias, dicas práticas sobre homologação e tudo o que você precisa saber sobre o mercado de energia solar.
        </p>
      </header>

      {/* 3. Container da Lista de Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlogList posts={safePosts} />
      </section>
      
    </main>
  );
}