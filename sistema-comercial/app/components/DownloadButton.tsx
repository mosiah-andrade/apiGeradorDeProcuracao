'use client'

import { gerarPdfProposta } from '@/lib/pdf-generator'
import { toast } from 'sonner'
import { sendGAEvent } from '@next/third-parties/google'

interface ItemProposta {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

// Interface do Perfil para o Whitelabel
interface Perfil {
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  company_logo_url: string | null;
}

interface Proposta {
  id: string;
  cliente_name: string;
  valor_total: number;
  potencia_kwp: number;
  itens_config: ItemProposta[] | null;
  consumo_mensal: number | null;
  geracao_estimada: number | null;
  payback_anos: number | null;
  // Adicionamos o perfil aqui ou como prop separada
  profiles?: Perfil; 
}

export default function DownloadButton({ proposta, perfil }: { proposta: Proposta, perfil?: Perfil }) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    sendGAEvent({ event: 'download_pdf', value: proposta.valor_total });

    try {
      toast.info("Gerando proposta técnica...");

      const itensParaPdf = (proposta.itens_config && proposta.itens_config.length > 0) 
        ? proposta.itens_config 
        : [{ 
            descricao: "Kit Sistema Fotovoltaico Profissional", 
            quantidade: 1, 
            valorUnitario: proposta.valor_total 
          }];

      const dadosPerfil = perfil || proposta.profiles;

      // Obter o objeto doc do jsPDF
      const doc = await gerarPdfProposta({
        id: proposta.id,
        cliente: proposta.cliente_name,
        potencia: proposta.potencia_kwp,
        valor: proposta.valor_total,
        itens: itensParaPdf,
        consumo_mensal: proposta.consumo_mensal,
        geracao_estimada: proposta.geracao_estimada,
        payback_anos: proposta.payback_anos,
        email: dadosPerfil?.email || '',
        phone: dadosPerfil?.phone || '',
        avatar_url: dadosPerfil?.avatar_url || '',
        company_logo_url: dadosPerfil?.company_logo_url || '',
      }, dadosPerfil);

      // O SEGREDO: Usar o output 'blob' direto do jsPDF
      const blob = doc.output('blob');
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proposta_Solar_${proposta.cliente_name.replace(/\s+/g, '_')}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      toast.error("Erro ao gerar o arquivo. Verifique sua conexão.");
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="text-blue-400 hover:text-blue-600 p-2 rounded-lg bg-blue-50 hover:bg-blue-200 transition-all flex-col  cursor-pointer z-50 "
      type="button"
    >

      <span className="text-lg">📄</span>
      <p className="text-sm font-medium">Download</p>
    </button>
  );
}