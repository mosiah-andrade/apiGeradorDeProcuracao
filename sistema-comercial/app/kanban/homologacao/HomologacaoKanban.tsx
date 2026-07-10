"use client";

import { useState } from "react";
import { ClipboardCheck, Settings } from "lucide-react";

import { KanbanColumn } from "../components/KanbanColumn";
import { KanbanConfigPanel } from "../components/KanbanConfigPanel";
import { KanbanOrphanColumn } from "../components/KanbanOrphanColumn";
import { HomologacaoDrawer } from "./HomologacaoDrawer";
import { useHomologacaoKanban } from "./hooks/useHomologacaoKanban";

const colunasProtegidasHomologacao = [
  "recebido",
  "em analise",
  "aguardando concessionaria",
  "aprovado",
];

export function HomologacaoKanban() {
  const {
    colunas,
    clientes,
    datasheetsDisponiveis,
    carregandoDatasheets,
    datasheetEmDownloadId,
    enviandoDatasheet,
    gerandoProcuracaoId,
    handleColunaDrop,
    handleCardDrop,
    adicionarColuna,
    excluirColunaCustomizada,
    atualizarCliente,
    recalcularDemanda,
    gerarProcuracao,
    alternarChecklist,
    alternarDatasheet,
    baixarDatasheet,
    cadastrarDatasheet,
  } = useHomologacaoKanban();
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [novoStatusNome, setNovoStatusNome] = useState("");
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null);

  const clientesSemStatus = clientes.filter(
    cliente => !cliente.status_id || !colunas.some(coluna => coluna.id === cliente.status_id)
  );
  const clienteSelecionado = clientes.find(cliente => cliente.id === clienteSelecionadoId) || null;

  function handleAdicionarColuna(event: React.FormEvent) {
    event.preventDefault();
    adicionarColuna(novoStatusNome);
    setNovoStatusNome("");
  }

  function handleExcluirColuna(id: string, nome: string) {
    const confirmar = confirm(`Excluir o status "${nome}"? Os projetos vinculados vao para "Sem Status".`);
    if (!confirmar) return;

    excluirColunaCustomizada(id);
  }

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Dados mockados</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Kanban de Homologacao</h1>
          <p className="text-sm text-slate-500">Arraste as colunas e mova os projetos entre os status de homologacao.</p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarConfig(!mostrarConfig)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-100"
        >
          <Settings className="w-4 h-4" />
          Customizar Status
        </button>
      </div>

      {mostrarConfig && (
        <KanbanConfigPanel
          novoStatusNome={novoStatusNome}
          setNovoStatusNome={setNovoStatusNome}
          adicionarColuna={handleAdicionarColuna}
          colunas={colunas}
          colunasProtegidas={colunasProtegidasHomologacao}
          excluirColunaCustomizada={handleExcluirColuna}
        />
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 max-w-7xl mx-auto items-start">
        {colunas.map((coluna, index) => (
          <KanbanColumn
            key={coluna.id}
            coluna={coluna}
            index={index}
            clientes={clientes.filter(cliente => cliente.status_id === coluna.id)}
            onColumnDrop={handleColunaDrop}
            onCardDrop={handleCardDrop}
            onCardClick={setClienteSelecionadoId}
            onPropostaClick={() => undefined}
          />
        ))}

        <KanbanOrphanColumn
          clientes={clientesSemStatus}
          onCardDrop={handleCardDrop}
          onCardClick={setClienteSelecionadoId}
        />
      </div>

      <HomologacaoDrawer
        cliente={clienteSelecionado}
        datasheetsDisponiveis={datasheetsDisponiveis}
        carregandoDatasheets={carregandoDatasheets}
        datasheetEmDownloadId={datasheetEmDownloadId}
        enviandoDatasheet={enviandoDatasheet}
        gerandoProcuracao={gerandoProcuracaoId === clienteSelecionado?.id}
        onClose={() => setClienteSelecionadoId(null)}
        onClienteChange={atualizarCliente}
        onRecalcularDemanda={recalcularDemanda}
        onGerarProcuracao={gerarProcuracao}
        onToggleChecklist={alternarChecklist}
        onToggleDatasheet={alternarDatasheet}
        onBaixarDatasheet={baixarDatasheet}
        onCadastrarDatasheet={cadastrarDatasheet}
      />
    </section>
  );
}
