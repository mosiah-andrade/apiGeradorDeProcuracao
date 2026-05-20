'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FileText, Plus, Loader2, Tag, Search, Download, Trash2 } from 'lucide-react';

interface Inversor {
  id: string;
  modelo: string;
  fabricante: string;
  potencia_kw: number;
  tags: string[];
  datasheet_path: string;
  criado_em: string;
}

// Interface para controlar a lista temporária no formulário
interface ItemInversorTemporario {
  modelo: string;
  potencia: string;
}

export default function AdminInversoresPage() {
  const supabase = createClient();
  const router = useRouter();

  // Estados de Controle de Acesso
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados dos Inputs Atuais
  const [modeloInput, setModeloInput] = useState('');
  const [potenciaInput, setPotenciaInput] = useState('');
  
  // Estado da Lista Temporária de Inversores antes do envio
  const [itensTemporarios, setItensTemporarios] = useState<ItemInversorTemporario[]>([]);

  // Demais Estados do Formulário
  const [fabricante, setFabricante] = useState('');
  const [tags, setTags] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Estado da Lista Vinda do Banco e Filtro
  const [inversores, setInversores] = useState<Inversor[]>([]);
  const [busca, setBusca] = useState('');
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);

  useEffect(() => {
    async function verificarAcessoECarregar() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.log("Nenhuma sessão activa encontrada.");
          router.replace('/proposta');
          return;
        }

        const { data: perfil, error: perfilError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (perfilError) {
          console.error("Erro ao buscar o perfil do usuário:", perfilError.message);
          router.replace('/proposta');
          return;
        }

        if (!perfil || perfil.role !== 'admin') {
          console.log(`Acesso negado. Perfil encontrado:`, perfil);
          router.replace('/proposta');
          return;
        }

        setIsAdmin(true);
        
        // Carrega a listagem inicial
        const { data: itens, error: listError } = await supabase
          .from('inversores')
          .select('*')
          .order('criado_em', { ascending: false });

        if (!listError && itens) {
          setInversores(itens);
        }
      } catch (err) {
        console.error("Erro inesperado na guarda de rota:", err);
        router.replace('/proposta');
      } finally {
        setLoadingAuth(false);
        setCarregandoLista(false);
      }
    }

    verificarAcessoECarregar();
  }, [router, supabase]);

  async function carregarInversores() {
    setCarregandoLista(true);
    const { data, error } = await supabase
      .from('inversores')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setInversores(data);
    }
    setCarregandoLista(false);
  }

  // Adiciona o par Modelo + Potência para a lista visual temporária
  function handleAdicionarItemTemporario() {
    if (!modeloInput.trim()) return alert('Digite o modelo do equipamento.');
    if (!potenciaInput.trim() || parseFloat(potenciaInput) <= 0) return alert('Digite uma potência válida.');

    setItensTemporarios([
      ...itensTemporarios,
      { modelo: modeloInput.trim(), potencia: potenciaInput.trim() }
    ]);

    // Limpa apenas os campos de modelo e potência para o próximo input
    setModeloInput('');
    setPotenciaInput('');
  }

  // Remove um item da lista temporária antes de enviar
  function handleRemoverItemTemporario(index: number) {
    setItensTemporarios(itensTemporarios.filter((_, i) => i !== index));
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (itensTemporarios.length === 0) {
      return alert('Adicione pelo menos um modelo com potência na lista temporária.');
    }
    if (!arquivo) return alert('Selecione o arquivo PDF do Datasheet.');

    setEnviando(true);
    try {
      // 1. Faz upload de UM ÚNICO arquivo PDF para o Storage
      const fileExt = arquivo.name.split('.').pop();
      const nomeBaseLimpo = itensTemporarios[0].modelo.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filePath = `${Date.now()}_ds_${nomeBaseLimpo}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('datasheets')
        .upload(filePath, arquivo);

      if (uploadError) throw uploadError;

      // 2. Prepara as tags comuns
      const arrayTags = tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);

      // 3. Mapeia a lista temporária para o formato do banco de dados (Bulk Insert)
      const rowsToInsert = itensTemporarios.map((item) => ({
        modelo: item.modelo,
        fabricante,
        potencia_kw: parseFloat(item.potencia),
        tags: arrayTags,
        datasheet_path: filePath, // Todos compartilham rigorosamente o mesmo PDF único
      }));

      // 4. Insere em lote no Supabase
      const { error: insertError } = await supabase
        .from('inversores')
        .insert(rowsToInsert);

      if (insertError) throw insertError;

      alert(`${rowsToInsert.length} inversor(es) cadastrado(s) com sucesso!`);
      
      // Limpa todo o formulário e estados temporários
      setItensTemporarios([]);
      setFabricante('');
      setTags('');
      setArquivo(null);
      
      await carregarInversores();
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  }

  async function handleBaixarDatasheet(path: string, id: string, modeloInversor: string) {
    setBaixandoId(id);
    try {
      const { data, error } = await supabase.storage
        .from('datasheets')
        .createSignedUrl(path, 60);

      if (error) throw error;

      if (data?.signedUrl) {
        const nomeFicheiroLimpo = modeloInversor
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');

        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = `datasheet_${nomeFicheiroLimpo}.pdf`;
        link.target = '_blank'; 

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert(`Erro ao obter o arquivo: ${err.message}`);
    } finally {
      setBaixandoId(null);
    }
  }

  const inversoresFiltrados = inversores.filter((inv) => {
    const termo = busca.toLowerCase();
    return (
      inv.modelo.toLowerCase().includes(termo) ||
      inv.fabricante.toLowerCase().includes(termo) ||
      inv.tags?.some((t) => t.toLowerCase().includes(termo))
    );
  });

  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Verificando credenciais de acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Gerenciamento de Inversores</h1>
          <p className="text-slate-500 text-sm mt-1">Área exclusiva do administrador para controle do catálogo técnico.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* FORMULÁRIO DE CADASTRO */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
              <Plus className="h-5 w-5 text-slate-900" />
              <h2 className="font-semibold text-slate-800">Novo Equipamento</h2>
            </div>
            
            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Fabricante</label>
                <input type="text" required value={fabricante} onChange={e => setFabricante(e.target.value)}
                  className="w-full text-sm border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-200 transition" />
              </div>

              {/* SEÇÃO DINÂMICA: ADICIONAR MODELOS E POTÊNCIAS */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-3">
                <span className="block text-xs font-bold uppercase text-slate-600">Modelos do Datasheet</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Modelo</label>
                    <input type="text" value={modeloInput} onChange={e => setModeloInput(e.target.value)} placeholder="Ex: SUN2000-50KTL"
                      className="w-full text-xs border rounded bg-white p-2 outline-none focus:ring-1 focus:ring-slate-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Potência (kW)</label>
                    <input type="number" step="0.01" value={potenciaInput} onChange={e => setPotenciaInput(e.target.value)} placeholder="50"
                      className="w-full text-xs border rounded bg-white p-2 outline-none focus:ring-1 focus:ring-slate-400" />
                  </div>
                </div>

                <button type="button" onClick={handleAdicionarItemTemporario}
                  className="w-full py-1.5 px-3 border border-dashed border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-medium rounded transition flex items-center justify-center gap-1">
                  <Plus className="h-3 w-3" /> Incluir Modelo na Lista
                </button>

                {/* LISTA PREVISUAL DA DIGITAÇÃO */}
                {itensTemporarios.length > 0 && (
                  <div className="border-t pt-2 mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {itensTemporarios.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-100 text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[120px]">{item.modelo}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-semibold">{item.potencia} kW</span>
                          <button type="button" onClick={() => handleRemoverItemTemporario(index)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Tags</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  className="w-full text-sm border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-200 transition" placeholder="Separadas por vírgula" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Datasheet Compartilhado (PDF)</label>
                <input type="file" accept=".pdf" required onChange={e => setArquivo(e.target.files?.[0] || null)}
                  className="w-full text-sm border file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-100 hover:file:bg-slate-200 p-1 bg-slate-50 rounded-lg border-slate-200 cursor-pointer" />
              </div>

              <button type="submit" disabled={enviando || itensTemporarios.length === 0}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm p-3 rounded-lg transition disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2">
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : `Salvar Catálogo (${itensTemporarios.length} itens)`}
              </button>
            </form>
          </div>

          {/* SEÇÃO DA LISTAGEM COM FILTRO INTEGRADO */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-800">Modelos Cadastrados</h2>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar modelo, marca ou tag..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-slate-200 transition"
                />
              </div>
            </div>

            {carregandoLista ? (
              <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : inversoresFiltrados.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {busca ? 'Nenhum resultado encontrado para a pesquisa.' : 'Nenhum inversor adicionado ao catálogo técnico.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-medium">
                      <th className="p-3">Modelo / Marca</th>
                      <th className="p-3">Potência</th>
                      <th className="p-3">Tags</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inversoresFiltrados.map((inv) => (
                      <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{inv.modelo}</p>
                          <p className="text-xs text-slate-400">{inv.fabricante}</p>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{inv.potencia_kw} kW</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {inv.tags?.map((tag, idx) => (
                              <span key={idx} className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200/40">
                                <Tag className="h-2.5 w-2.5" /> {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                            <button
                                onClick={() => handleBaixarDatasheet(inv.datasheet_path, inv.id, inv.modelo)}
                                disabled={baixandoId === inv.id}
                                title="Baixar Datasheet"
                                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition disabled:opacity-50 cursor-pointer"
                                >
                                {baixandoId === inv.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}