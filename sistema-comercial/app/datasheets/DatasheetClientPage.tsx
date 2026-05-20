"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Download, FileText, RefreshCw } from "lucide-react";

// 1. Atualizada a interface para bater exatamente com as colunas do seu banco
interface Datasheet {
  id: string;
  fabricante: string;
  modelo: string;
  potencia_kw: number;
  tags: string[];
  datasheet_path: string; // <-- Mudado de arquivo_url para datasheet_path
  created_at: string;
}

interface DatasheetClientPageProps {
  initialData: Datasheet[];
}

export default function DatasheetClientPage({ initialData }: DatasheetClientPageProps) {
  const supabase = createClient();
  const [busca, setBusca] = useState("");
  const [baixandoId, setBaixandoId] = useState<string | null>(null);

  // Filtro em tempo real por fabricante ou modelo
  const datasheetsFiltrados = useMemo(() => {
    return initialData.filter((item) => {
      const termo = busca.toLowerCase();
      return (
        item.fabricante?.toLowerCase().includes(termo) ||
        item.modelo?.toLowerCase().includes(termo)
      );
    });
  }, [busca, initialData]);

  // Função de download atualizada
  const handleDownload = async (item: Datasheet) => {
    if (!item || !item.datasheet_path) {
      alert("Este datasheet não possui um arquivo PDF associado.");
      return;
    }

    try {
      setBaixandoId(item.id);

      // Gera a URL assinada apontando para a coluna correta
      const { data, error } = await supabase.storage
        .from("datasheets") // <-- Nome do bucket criado na migração
        .createSignedUrl(item.datasheet_path, 60, {
          download: true, // Força o download automático do PDF
        });

      if (error) throw error;

      if (data?.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = `${item.fabricante}_${item.modelo}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Erro ao baixar o arquivo:", err);
      alert("Não foi possível transferir o arquivo. Verifique se ele existe no Bucket do Storage.");
    } finally {
      setBaixandoId(null);
    }
  };

  return (
    <div>
      {/* Barra de Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por fabricante ou modelo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-blue-50 border border-blue-200 dark:border-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Grid de Resultados */}
      {datasheetsFiltrados.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg  bg-blue-50">
          <FileText className="mx-auto h-12 w-12  text-blue-200 mb-3" />
          <h3 className="text-sm font-medium text-zinc-600 ">Nenhum datasheet encontrado</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {datasheetsFiltrados.map((item) => (
            <div
              key={item.id}
              className="p-5  bg-gray-50 border border-blue-800 rounded-lg shadow-lg flex flex-col justify-between transition hover:shadow-md"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full   bg-blue-900 text-white">
                    Inversor ({item.potencia_kw} kW)
                  </span>
                </div>
                <h3 className="font-semibold text-blue-900  text-lg leading-tight">
                  {item.modelo}
                </h3>
                <p className="text-sm  text-zinc-600 mt-0.5 mb-2">
                  Fabricante: <span className="font-medium text-zinc-500">{item.fabricante}</span>
                </p>
                
                {/* Renderização de Tags dinâmicas do banco */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11px] bg-blue-800 text-zinc-300 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDownload(item)}
                disabled={baixandoId === item.id}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white font-medium rounded-md text-sm transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {baixandoId === item.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Baixar Datasheet PDF
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}