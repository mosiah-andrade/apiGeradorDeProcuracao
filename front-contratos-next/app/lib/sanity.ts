// app/lib/sanity.ts

import { createClient } from "next-sanity";
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: "h5k6om8h", // Copie do painel da Sanity
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false, // Use 'false' para ver as atualizações em tempo real enquanto desenvolve
});

// Configuração do construtor de URLs de imagem
const builder = imageUrlBuilder(client);

// Função auxiliar para gerar URLs de imagem nos componentes
export function urlFor(source: any) {
  return builder.image(source);
}