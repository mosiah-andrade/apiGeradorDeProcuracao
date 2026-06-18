'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, Mail, Phone, MapPin, FilePieChart } from 'lucide-react';
import { NovoClienteModal } from '../components/NovoClienteModal';
import { FichaClienteDrawer } from '../components/FichaClienteDrawer';
import { ModalGerarPropostaSolar } from '../components/ModalGerarPropostaSolar';

interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  documento: string | null;
  created_at: string;
  concessionaria: string | null;
  codigo_uc: string | null;
  kanban_status?: { nome: string };
}

export default function ClientesPage() {
  const supabase = createClient();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para gerenciar as visualizações flutuantes e gavetas laterais
  const [clienteSelecionadoFichaId, setClienteSelecionadoFichaId] = useState<string | null>(null);
  const [clienteParaProposta, setClienteParaProposta] = useState<any | null>(null);

  async function fetchClientes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*, kanban_status(nome)')
        .order('nome', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  // Filtro avançado unificado buscando por Nome ou E-mail digitado
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
    (cliente.email && cliente.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl animate-fade-in">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meus Clientes</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie a base de clientes do seu sistema comercial.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Novo Cliente
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white transition-all text-slate-800 shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-slate-500 font-medium">Nenhum cliente encontrado.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-amber-500 hover:text-amber-600 text-sm font-semibold mt-2 inline-block underline"
          >
            Cadastrar o primeiro cliente
          </button>
        </div>
      ) : (
        /* Grid de Exibição dos Clientes Solares */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => {
            const statusNome = cliente.kanban_status?.nome || 'Sem Status';
            const ehProposta = statusNome.toLowerCase().includes('proposta');

            return (
              <div 
                key={cliente.id} 
                onClick={() => setClienteSelecionadoFichaId(cliente.id)} // Abre a ficha lateral do cliente ao clicar no card
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:border-slate-200 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-lg group-hover:bg-amber-100 transition-colors">
                        {cliente.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-base group-hover:text-amber-600 transition-colors line-clamp-1">{cliente.nome}</h3>
                        <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {statusNome}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informações Cadastrais Rápidas */}
                  <div className="space-y-2 text-sm text-slate-600">
                    {cliente.email && <div className="flex items-center gap-2 truncate"><Mail className="w-4 h-4 text-slate-400 shrink-0" /><span>{cliente.email}</span></div>}
                    {cliente.telefone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400 shrink-0" /><span>{cliente.telefone}</span></div>}
                    {(cliente.cidade || cliente.estado) && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{`${cliente.cidade || ''}${cliente.cidade && cliente.estado ? ' - ' : ''}${cliente.estado || ''}`}</span>
                      </div>
                    )}
                  </div>

                  {/* Campo reativo para precificar direto da listagem se o status contiver "proposta" */}
                  {ehProposta && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                      <div className="text-xs text-amber-800 font-medium">Disponível para precificação</div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Impede o clique de disparar a abertura do Drawer lateral
                          setClienteParaProposta(cliente);
                        }}
                        className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <FilePieChart className="w-3.5 h-3.5" /> Precificar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais Globais e Painéis Compartilhados da Ficha Técnica */}
      <FichaClienteDrawer 
        clienteId={clienteSelecionadoFichaId} 
        onClose={() => setClienteSelecionadoFichaId(null)} 
        onClienteAtualizado={fetchClientes}
      />

      <ModalGerarPropostaSolar 
        cliente={clienteParaProposta} 
        onClose={() => setClienteParaProposta(null)} 
        onSuccess={fetchClientes} 
      />

      <NovoClienteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchClientes} 
      />
    </div>
  );
}