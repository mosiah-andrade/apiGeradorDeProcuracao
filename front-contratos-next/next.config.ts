import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Gria uma pasta 'out' com HTML/CSS/JS estático
  trailingSlash: true,
  images: {
    unoptimized: true, // Obrigatório na Hostinger (sem servidor Node para processar imagens)
  },
  // Otimização do compilador React
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Remove console.log em produção
  },
};

export default nextConfig;