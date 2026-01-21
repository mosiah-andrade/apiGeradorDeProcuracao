// app/lib/sanity.ts

import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "h5k6om8h", // Copie do painel da Sanity
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false, // Use 'false' para ver as atualizações em tempo real enquanto desenvolve
});