// 1. A SOLUÇÃO AQUI: Note a palavra "export" antes de "interface"
export interface AnuncioType {
  adKey: string;
  link: string;
  imagem: string;
}

// 2. Os seus dados, também com "export"
export const adsData: AnuncioType[] = [
  {
    adKey: "seu_site_solar",
    link: "https://lp.asaweb.tech",
    imagem: "/ads/1.png"
  },
  {
    adKey: "calculadora_solar_pro",
    link: "https://asaweb.tech/calculadora-solar",
    imagem: "/ads/2.png"
  },
  {
    adKey: "gerador_de_procuracao",
    link: "https://asaweb.tech",
    imagem: "/ads/3.png"
  },
  {
    adKey: "gerador_de_posse",
    link: "https://asaweb.tech/declaracao-posse/",
    imagem: "/ads/4.png"
  }
];