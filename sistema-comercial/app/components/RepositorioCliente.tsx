'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileUp, Eye, Loader2 } from 'lucide-react';

type CampoConfig = { id: string; nome: string; tipo: string; obrigatorio: boolean; };
type ArquivoCliente = { id: string; campo_id: string; caminho_storage: string; nome_arquivo: string; };

export function RepositorioCliente({ clienteId }: { clienteId: string }) {
  const supabase = createClient();
  const [campos, setCampos] = useState<CampoConfig[]>([]);
  const [arquivos, setArquivos] = useState<ArquivoCliente[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarRepositorio();
  }, [clienteId]);

  async function carregarRepositorio() {
    setLoading(true);
    // 1. Busca as regras globais
    const { data: configCampos } = await supabase
      .from('config_campos_repositorio')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    // 2. Busca os arquivos do cliente
    const { data: arquivosEnviados } = await supabase
      .from('arquivos_clientes')
      .select('*')
      .eq('cliente_id', clienteId);

    if (configCampos) setCampos(configCampos);
    if (arquivosEnviados) setArquivos(arquivosEnviados);
    setLoading(false);
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>, campoId: string) {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      setUploadingId(campoId);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const caminhoStorage = `${clienteId}/${campoId}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload pro bucket privado
      const { error: uploadError } = await supabase.storage
        .from('repositorio_clientes')
        .upload(caminhoStorage, file);

      if (uploadError) throw uploadError;

      // Salva referência no banco
      const { error: dbError } = await supabase
        .from('arquivos_clientes')
        .insert({ cliente_id: clienteId, campo_id: campoId, caminho_storage: caminhoStorage, nome_arquivo: file.name });

      if (dbError) throw dbError;
      
      await carregarRepositorio();
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar documento. Tente novamente.');
    } finally {
      setUploadingId(null);
    }
  }

  async function visualizarArquivo(caminhoStorage: string) {
    // Gera URL segura que expira em 60 segundos
    const { data, error } = await supabase.storage
      .from('repositorio_clientes')
      .createSignedUrl(caminhoStorage, 60);

    if (error) {
      alert('Erro ao gerar link de visualização.');
      return;
    }
    window.open(data.signedUrl, '_blank');
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-4 mt-4">
      {campos.map((campo) => {
        const arquivoEnviado = arquivos.find(a => a.campo_id === campo.id);
        const isUploading = uploadingId === campo.id;

        return (
          <div key={campo.id} className="border border-slate-200 p-4 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                {campo.nome} {campo.obrigatorio && <span className="text-red-500">*</span>}
              </h3>
              <p className="text-xs text-slate-500">Aceita: {campo.tipo === 'foto' ? 'Imagens' : 'PDF'}</p>
            </div>

            {arquivoEnviado ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 truncate max-w-[150px]" title={arquivoEnviado.nome_arquivo}>
                  {arquivoEnviado.nome_arquivo}
                </span>
                <button 
                  onClick={() => visualizarArquivo(arquivoEnviado.caminho_storage)}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" /> Abrir
                </button>
              </div>
            ) : (
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'}`}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                {isUploading ? 'Enviando...' : 'Anexar'}
                <input 
                  type="file" 
                  className="hidden" 
                  accept={campo.tipo === 'foto' ? 'image/jpeg,image/png' : 'application/pdf'} 
                  onChange={(e) => handleUpload(e, campo.id)}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}