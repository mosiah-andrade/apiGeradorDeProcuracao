'use client';

import { useState } from 'react';
import { useDadosCliente } from './useDadosCliente';
import { DrawerWrapper } from './subcomponets/DrawerWrapper';
import { CabecalhoFichaCliente } from './subcomponets/CabecalhoFichaCliente';
import { GerenciadorStatusKanban } from './subcomponets/GerenciadorStatusKanban';
import { FormularioDadosCliente } from './subcomponets/FormularioDadosCliente';
import { HistoricoPropostas } from './subcomponets/HistoricoPropostas';
import { BotaoExcluirCliente } from './subcomponets/BotaoExcluirCliente';
import { RepositorioCliente } from '../RepositorioCliente';
import { ModalGerarPropostaSolar } from '../ModalGerarPropostaSolar';
import { PainelComercialCliente } from './subcomponets/PainelComercialCliente';

interface Props {
  clienteId: string | null;
  onClose: () => void;
  onClienteAtualizado?: () => void;
}

export function FichaClienteDrawer({ clienteId, onClose, onClienteAtualizado }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<'detalhes' | 'comercial' | 'documentos'>('detalhes');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mostrarProposta, setMostrarProposta] = useState(false);

  const { 
    cliente, handleChangeCliente, salvarCliente, excluirCliente,
    propostas, setPropostas,
    listaStatus, setListaStatus,
    loading, isPending, supabase
  } = useDadosCliente(clienteId, () => {
    setModoEdicao(false);
    if (onClienteAtualizado) onClienteAtualizado();
  }, onClose);

  if (!clienteId) return null;

  return (
    <DrawerWrapper >
      <CabecalhoFichaCliente 
        
        abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva}
        modoEdicao={modoEdicao} isPending={isPending} onClose={onClose}
        onToggleEdicao={() => modoEdicao ? salvarCliente() : setModoEdicao(true)} 
      />

      {loading || !cliente ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col justify-between overflow-y-auto overflow-x-hidden bg-white p-4 sm:p-6">
          {abaAtiva === 'detalhes' ? (
            <div className="min-w-0 space-y-6">
              <GerenciadorStatusKanban 
                statusAtualId={cliente.status_id}
                statusNome={cliente.kanban_status?.nome || ''}
                listaStatus={listaStatus}
                modoEdicao={modoEdicao}
                supabase={supabase}
                onChangeStatus={(id) => handleChangeCliente('status_id', id)}
                onStatusAtualizado={setListaStatus}
              />
              <FormularioDadosCliente 
                dados={cliente} 
                modoEdicao={modoEdicao} 
                onChange={handleChangeCliente}
              />
              
              <HistoricoPropostas 
                propostas={propostas} 
                supabase={supabase}
                onDeleteProposta={(id) => setPropostas(prev => prev.filter(p => p.id !== id))}
              />

              {modoEdicao && (
                <BotaoExcluirCliente onExcluir={excluirCliente} isPending={isPending} />
              )}
            </div>
          ) : abaAtiva === 'comercial' ? (
            <PainelComercialCliente
              cliente={cliente}
              propostas={propostas}
              modoEdicao={modoEdicao}
              onChange={handleChangeCliente}
              onCriarProposta={() => setMostrarProposta(true)}
            />
          ) : (
            <div className="h-full">
              <div className="mb-4">
                <h3 className="font-bold text-slate-800">Repositório de Arquivos</h3>
                <p className="text-xs text-slate-500">Faça o upload de laudos, faturas e contas associadas a este cliente.</p>
              </div>
              <RepositorioCliente clienteId={clienteId} />
            </div>
          )}
        </div>
      )}
      <ModalGerarPropostaSolar
        cliente={mostrarProposta ? cliente : null}
        onClose={() => setMostrarProposta(false)}
        onSuccess={() => {
          setMostrarProposta(false);
          if (onClienteAtualizado) onClienteAtualizado();
        }}
      />
    </DrawerWrapper>
  );
}
