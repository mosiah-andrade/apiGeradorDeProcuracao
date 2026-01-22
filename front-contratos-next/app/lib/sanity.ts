// app/lib/sanity.ts
import { createClient } from "next-sanity";
import createImageUrlBuilder from '@sanity/image-url'; // <-- Mudou aqui

export const client = createClient({
  projectId: "h5k6om8h", 
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false, 
});

// Configuração atualizada
const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}