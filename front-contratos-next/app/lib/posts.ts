// app/lib/posts.ts

export interface Post {
  id: string;
  title: string;
  content: string; // O texto completo do artigo
  excerpt: string; // Resumo para a lista
  date: string;
  category: string;
}

// Simulando um banco de dados
export const posts: Post[] = [
  {
    id: "1",
    title: "Como homologar sistemas fotovoltaicos",
    excerpt: "O passo a passo completo para evitar a reprovação na concessionária.",
    content: `
      <p>A homologação é uma etapa crucial... (texto longo aqui)</p>
      <h2>Passo 1: Documentação</h2>
      <p>Tenha em mãos o diagrama unifilar...</p>
    `,
    date: "20 Jan 2026",
    category: "Homologação"
  },
  {
    id: "2",
    title: "Novas regras para integradores em 2026",
    excerpt: "O que mudou na legislação e como isso afeta os seus projetos.",
    content: "<p>Conteúdo do artigo sobre legislação...</p>",
    date: "18 Jan 2026",
    category: "Legislação"
  },
  // Adicione mais posts aqui...
];

export function getPost(id: string) {
  return posts.find((post) => post.id === id);
}