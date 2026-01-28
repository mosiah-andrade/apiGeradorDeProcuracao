// app/blog/page.tsx
import { getPosts } from '../lib/posts'; // Ajuste o caminho se necessário
import BlogList from '../../components/BlogList'; // Ajuste o caminho para onde criou o arquivo acima

export const dynamic = 'force-static';

export default async function BlogPage() {
  // Busca os dados no servidor (Sanity)
  const posts = await getPosts();

  // Se o getPosts falhar e retornar null/undefined, garantimos um array vazio
  const safePosts = posts || [];

  return (
    <div className="">
      <header style={{textAlign: 'center', marginBottom: '50px', paddingTop: '30px'}}>
        <h1>Blog Solar</h1>
        <p style={{fontSize: '1.2rem', color: '#64748b'}}>
          Notícias e dicas sobre homologação e energia solar.
        </p>
      </header>

      {/* Aqui entregamos os dados para o componente que sabe filtrar */}
      <BlogList posts={safePosts} />
    </div>
  );
}