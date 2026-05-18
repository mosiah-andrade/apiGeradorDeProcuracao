'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FileText, Plus, Loader2, Tag } from 'lucide-react';

interface Inversor {
  id: string;
  modelo: string;
  fabricante: string;
  potencia_kw: number;
  tags: string[];
  datasheet_path: string;
  criado_em: string;
}

export default function AdminInversoresPage() {
  const supabase = createClient();
  const router = useRouter();

  // Estados de Controle de Acesso
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados do Formulário
  const [modelo, setModelo] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [potencia, setPotencia] = useState('');
  const [tags, setTags] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Estado da Lista
  const [inversores, setInversores] = useState<Inversor[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  useEffect(() => {
    async function verificarAcessoECarregar() {
      try {
        // 1. Pega a sessão atual do usuário de forma segura
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.log("Nenhuma sessão ativa encontrada.");
          router.replace('/proposta');
          return;
        }

        // 2. Busca o papel (role) diretamente na tabela 'profiles'
        // Busca o papel (role) usando maybeSingle()
        const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle(); // <-- Alterado aqui de .single() para .maybeSingle()

        if (perfilError) {
        console.error("Erro ao buscar o perfil do usuário:", perfilError.message);
        router.replace('/proposta');
        return;
        }

        // Se o perfil não existir ou a role não for admin, redireciona
        if (!perfil || perfil.role !== 'admin') {
        console.log(`Acesso negado. Perfil encontrado:`, perfil);
        router.replace('/proposta');
        return;
        }

        // Se chegou até aqui, o usuário é administrador legítimo
        setIsAdmin(true);
        
        // Carrega a listagem após confirmar a identidade
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

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo) return alert('Selecione o arquivo PDF.');

    setEnviando(true);
    try {
      const fileExt = arquivo.name.split('.').pop();
      const nomeLimpo = modelo.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filePath = `${Date.now()}_${nomeLimpo}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('datasheets')
        .upload(filePath, arquivo);

      if (uploadError) throw uploadError;

      const arrayTags = tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0);

      const { error: insertError } = await supabase
        .from('inversores')
        .insert([{
          modelo,
          fabricante,
          potencia_kw: parseFloat(potencia),
          tags: arrayTags,
          datasheet_path: filePath,
        }]);

      if (insertError) throw insertError;

      alert('Inversor cadastrado!');
      setModelo(''); setFabricante(''); setPotencia(''); setTags(''); setArquivo(null);
      await carregarInversores();
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  }

  // ENQUANTO ESTIVER VERIFICANDO NO BANCO, MOSTRA APENAS A TELA DE CARREGAMENTO
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

  // SE TERMINOU DE CARREGAR E NÃO É ADMIN, INTERROMPE A RENDERIZAÇÃO COMPLETAMENTE
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gerenciamento de Inversores</h1>
          <p className="text-slate-500 text-sm mt-1">Área exclusiva do administrador para controle do catálogo técnico.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* FORMULÁRIO */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
              <Plus className="h-5 w-5 text-slate-900" />
              <h2 className="font-semibold text-slate-800">Novo Equipamento</h2>
            </div>
            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Modelo</label>
                <input type="text" required value={modelo} onChange={e => setModelo(e.target.value)}
                  className="w-full text-sm border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-200 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Fabricante</label>
                <input type="text" required value={fabricante} onChange={e => setFabricante(e.target.value)}
                  className="w-full text-sm border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-200 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Potência Nominal (kW)</label>
                <input type="number" step="0.01" required value={potencia} onChange={e => setPotencia(e.target.value)}
                  className="w-full text-sm border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-200 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Tags</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  className="w-full text-sm border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-slate-200 transition" placeholder="Separadas por vírgula" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Datasheet (PDF)</label>
                <input type="file" accept=".pdf" required onChange={e => setArquivo(e.target.files?.[0] || null)}
                  className="w-full text-sm border p-1 bg-slate-50 rounded-lg border-slate-200 cursor-pointer" />
              </div>
              <button type="submit" disabled={enviando}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm p-3 rounded-lg transition disabled:bg-slate-300 flex items-center justify-center gap-2">
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar no Catálogo'}
              </button>
            </form>
          </div>

          {/* LISTA */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
              <FileText className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Modelos Cadastrados ({inversores.length})</h2>
            </div>
            {carregandoLista ? (
              <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : inversores.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">Nenhum inversor adicionado ao catálogo técnico.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-medium">
                      <th className="p-3">Modelo / Marca</th>
                      <th className="p-3">Potência</th>
                      <th className="p-3">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inversores.map((inv) => (
                      <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{inv.modelo}</p>
                          <p className="text-xs text-slate-400">{inv.fabricante}</p>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{inv.potencia_kw} kW</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {inv.tags?.map((tag, idx) => (
                              <span key={idx} className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200/40">
                                <Tag className="h-2.5 w-2.5" /> {tag}
                              </span>
                            ))}
                          </div>
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