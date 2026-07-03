'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, FileText, Image as ImageIcon, Check, X, GripVertical } from 'lucide-react';

interface CampoConfig {
  id: string;
  nome: string;
  tipo: 'foto' | 'pdf';
  obrigatorio: boolean;
  ordem: number;
  ativo: boolean;
}

export default function ConfiguracaoDocumentosPage() {
  const supabase = createClient();
  const [campos, setCampos] = useState<CampoConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o formulário de criação
  const [isAdicionando, setIsAdicionando] = useState(false);
  const [novoCampo, setNovoCampo] = useState({
    nome: '',
    tipo: 'pdf',
    obrigatorio: false,
    ordem: 0
  });

  async function fetchCampos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('config_campos_repositorio')
      .select('*')
      .order('ordem', { ascending: true });

    if (!error && data) {
      setCampos(data);
      // Sugere a próxima ordem automaticamente
      setNovoCampo(prev => ({ ...prev, ordem: data.length + 1 }));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCampos();
  }, []);

    async function handleSalvarNovoCampo(e: React.FormEvent) {
    e.preventDefault();
    if (!novoCampo.nome.trim()) return alert('O nome do campo é obrigatório.');

    // 1. Inserção
    const { error } = await supabase
        .from('config_campos_repositorio')
        .insert([
        {
            nome: novoCampo.nome,
            tipo: novoCampo.tipo,
            obrigatorio: novoCampo.obrigatorio,
            ordem: novoCampo.ordem,
            ativo: true
        }
        ]);

    if (error) {
        console.error('Erro detalhado:', error);
        alert('Erro ao salvar no banco. Verifique o console.');
    } else {
        // 2. Reset do formulário e atualização forçada
        setIsAdicionando(false);
        setNovoCampo({ nome: '', tipo: 'pdf', obrigatorio: false, ordem: 0 });
        
        // 3. Aguarda um milissegundo para garantir que o banco processou
        await new Promise(resolve => setTimeout(resolve, 500));
        fetchCampos(); 
    }
    }

  async function handleExcluir(id: string) {
    if (!confirm('Tem certeza que deseja excluir este campo?')) return;

    try {
        // 1. Tenta deletar
        const { error } = await supabase
        .from('config_campos_repositorio')
        .delete()
        .eq('id', id);

        // 2. Se houver erro, joga pro catch
        if (error) throw error;

        // 3. Sucesso: Atualiza o estado localmente para refletir na tela imediatamente
        setCampos(prev => prev.filter(campo => campo.id !== id));
        
    } catch (error: any) {
        console.error('Detalhes do erro na exclusão:', error);
        alert('Erro ao excluir: ' + (error.message || 'Verifique o console do navegador'));
    }
    }

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configurar Documentos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Defina quais documentos técnicos e legais os clientes precisam anexar.
          </p>
        </div>
        <button
          onClick={() => setIsAdicionando(!isAdicionando)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          {isAdicionando ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdicionando ? 'Cancelar' : 'Nova Regra de Arquivo'}
        </button>
      </div>

      {/* Formulário de Criação (Aparece ao clicar em "Nova Regra") */}
      {isAdicionando && (
        <form onSubmit={handleSalvarNovoCampo} className="bg-white border border-amber-200 p-6 rounded-2xl shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Adicionar Novo Campo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Documento</label>
              <input
                type="text"
                placeholder="Ex: Conta de Luz Atualizada"
                value={novoCampo.nome}
                onChange={(e) => setNovoCampo({ ...novoCampo, nome: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Arquivo</label>
              <select
                value={novoCampo.tipo}
                onChange={(e) => setNovoCampo({ ...novoCampo, tipo: e.target.value as 'foto' | 'pdf' })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
              >
                <option value="pdf">Documento (PDF)</option>
                <option value="foto">Imagem (JPG/PNG)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 h-[42px] pb-2">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={novoCampo.obrigatorio}
                  onChange={(e) => setNovoCampo({ ...novoCampo, obrigatorio: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                <span className="ml-3 text-sm font-medium text-slate-700">Obrigatório</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2 rounded-xl transition-colors">
              Salvar Campo
            </button>
          </div>
        </form>
      )}

      {/* Lista de Campos Configurados */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando configurações...</div>
        ) : campos.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">Nenhuma regra de documento configurada ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {campos.map((campo) => (
              <div key={campo.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-slate-300 cursor-move" />
                  
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${campo.tipo === 'pdf' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {campo.tipo === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-800 flex items-center gap-2">
                      {campo.nome}
                      {campo.obrigatorio && (
                        <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Obrigatório
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Arquivos aceitos: {campo.tipo === 'pdf' ? '.pdf' : '.jpg, .png'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleExcluir(campo.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Excluir regra"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}