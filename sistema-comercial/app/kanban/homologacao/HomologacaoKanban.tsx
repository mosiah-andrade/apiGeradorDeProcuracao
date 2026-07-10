"use client";

import { useState } from "react";
import { Check, ClipboardCheck, Copy, ExternalLink, FileText, Image as ImageIcon, Mail, Plus, Search, Settings, Store, Trash2, X } from "lucide-react";

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
    integradores,
    documentosPortal,
    datasheetsDisponiveis,
    carregandoHomologacao,
    carregandoDatasheets,
    datasheetEmDownloadId,
    documentoEmDownloadId,
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
    baixarDocumentoProjeto,
    cadastrarDatasheet,
    criarIntegrador,
    criarProjetoManual,
    criarDocumentoPortal,
    alternarDocumentoPortal,
    alternarObrigatoriedadeDocumentoPortal,
    removerDocumentoPortal,
    atualizarCamposAdicionais,
    atualizarEquipamentos,
    atualizarBeneficiarias,
    adicionarChecklistItem,
    atualizarChecklistItem,
    removerChecklistItem,
  } = useHomologacaoKanban();
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [novoStatusNome, setNovoStatusNome] = useState("");
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | null>(null);
  const [integradorAtivoId, setIntegradorAtivoId] = useState(integradores[0]?.id || "");
  const [novoIntegradorNome, setNovoIntegradorNome] = useState("");
  const [novoIntegradorContato, setNovoIntegradorContato] = useState("");
  const [buscaIntegrador, setBuscaIntegrador] = useState("");
  const [mostrarNovoIntegrador, setMostrarNovoIntegrador] = useState(false);
  const [mostrarIntegradores, setMostrarIntegradores] = useState(false);
  const [mostrarDocumentos, setMostrarDocumentos] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [novoDocumentoNome, setNovoDocumentoNome] = useState("");
  const [novoDocumentoTipo, setNovoDocumentoTipo] = useState<"pdf" | "foto">("pdf");
  const [novoDocumentoObrigatorio, setNovoDocumentoObrigatorio] = useState(true);

  const integradorAtivo = integradores.find(integrador => integrador.id === integradorAtivoId) || integradores[0];
  const clientesDoIntegrador = clientes.filter(cliente => cliente.integradorId === integradorAtivo?.id);
  const termoIntegrador = buscaIntegrador.trim().toLowerCase();
  const integradoresFiltrados = termoIntegrador
    ? integradores.filter(integrador =>
        integrador.nome.toLowerCase().includes(termoIntegrador) ||
        integrador.contato.toLowerCase().includes(termoIntegrador)
      )
    : integradores;
  const documentosAtivos = documentosPortal.filter(documento => documento.ativo);
  const portalIntegradorPath = integradorAtivo ? `/integrador/${integradorAtivo.id}` : "";
  const portalIntegradorUrl = typeof window === "undefined" || !portalIntegradorPath
    ? portalIntegradorPath
    : `${window.location.origin}${portalIntegradorPath}`;
  const clientesSemStatus = clientes.filter(
    cliente =>
      cliente.integradorId === integradorAtivo?.id &&
      (!cliente.status_id || !colunas.some(coluna => coluna.id === cliente.status_id))
  );
  const clienteSelecionado = clientes.find(cliente => cliente.id === clienteSelecionadoId) || null;

  if (carregandoHomologacao) {
    return (
      <section className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="text-sm font-semibold text-slate-500">Carregando homologacao...</span>
      </section>
    );
  }

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

  function handleCriarIntegrador(event: React.FormEvent) {
    event.preventDefault();
    const integrador = criarIntegrador(novoIntegradorNome, novoIntegradorContato);
    if (!integrador) return;

    setIntegradorAtivoId(integrador.id);
    setNovoIntegradorNome("");
    setNovoIntegradorContato("");
    setBuscaIntegrador("");
    setMostrarNovoIntegrador(false);
  }

  function handleCriarProjeto() {
    if (!integradorAtivo) return;
    const novoProjetoId = criarProjetoManual(integradorAtivo.id);
    setClienteSelecionadoId(novoProjetoId);
  }

  function handleCriarDocumento(event: React.FormEvent) {
    event.preventDefault();
    criarDocumentoPortal(novoDocumentoNome, novoDocumentoTipo, novoDocumentoObrigatorio);
    setNovoDocumentoNome("");
    setNovoDocumentoTipo("pdf");
    setNovoDocumentoObrigatorio(true);
  }

  function copiarLinkIntegrador() {
    if (!portalIntegradorUrl) return;
    void navigator.clipboard?.writeText(portalIntegradorUrl);
    setLinkCopiado(true);
    window.setTimeout(() => setLinkCopiado(false), 1800);
  }

  return (
    <section>
      <div className="flex flex-col gap-4 mb-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Homologacao</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Kanban de Homologacao</h1>
          <p className="text-sm text-slate-500">Cada integrador tem seu proprio kanban e link para enviar e acompanhar projetos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMostrarConfig(!mostrarConfig)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-100"
          >
            <Settings className="w-4 h-4" />
            Customizar Status
          </button>
          <button
            type="button"
            onClick={handleCriarProjeto}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-emerald-700">
                <Store className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Integrador ativo</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-bold text-slate-900">{integradorAtivo?.nome || "Nenhum integrador"}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {clientesDoIntegrador.length} projetos
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">{integradorAtivo?.contato || "Contato nao informado"}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMostrarIntegradores(!mostrarIntegradores)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
              >
                <Search className="h-4 w-4" />
                {mostrarIntegradores ? "Ocultar integradores" : "Trocar integrador"}
              </button>
              <button
                type="button"
                onClick={() => setMostrarDocumentos(!mostrarDocumentos)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
              >
                <FileText className="h-4 w-4" />
                Documentos ({documentosAtivos.length})
              </button>
              <button
                type="button"
                onClick={copiarLinkIntegrador}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
              >
                {linkCopiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {linkCopiado ? "Copiado" : "Copiar link"}
              </button>
              <a
                href={portalIntegradorPath}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir portal
              </a>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <PortalMetric label="Projetos atuais" value={clientesDoIntegrador.length.toString()} />
            <PortalMetric label="Em andamento" value={clientesDoIntegrador.filter(cliente => cliente.status_id !== "aprovado").length.toString()} />
            <PortalMetric label="Aprovados" value={clientesDoIntegrador.filter(cliente => cliente.status_id === "aprovado").length.toString()} />
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Link de acesso</span>
            <p className="mt-1 break-all text-xs font-semibold text-slate-600">{portalIntegradorUrl}</p>
          </div>

          {mostrarIntegradores && (
          <aside className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Integradores</h2>
                <p className="text-xs text-slate-500">{integradores.length} cadastrados</p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarNovoIntegrador(true)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
              >
                <Plus className="h-4 w-4" />
                Novo
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={buscaIntegrador}
                onChange={event => setBuscaIntegrador(event.target.value)}
                placeholder="Buscar integrador"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {mostrarNovoIntegrador && (
              <form onSubmit={handleCriarIntegrador} className="mb-3 rounded-xl border border-emerald-200 bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Novo integrador</span>
                  <button
                    type="button"
                    onClick={() => setMostrarNovoIntegrador(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Fechar cadastro"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    required
                    value={novoIntegradorNome}
                    onChange={event => setNovoIntegradorNome(event.target.value)}
                    placeholder="Nome do integrador"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
                  />
                  <input
                    value={novoIntegradorContato}
                    onChange={event => setNovoIntegradorContato(event.target.value)}
                    placeholder="E-mail ou WhatsApp"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
                  />
                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                    Criar integrador
                  </button>
                </div>
              </form>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {integradoresFiltrados.map(integrador => {
                const totalProjetos = clientes.filter(cliente => cliente.integradorId === integrador.id).length;
                const ativo = integradorAtivo?.id === integrador.id;

                return (
                  <button
                    key={integrador.id}
                    type="button"
                    onClick={() => setIntegradorAtivoId(integrador.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      ativo
                        ? "border-emerald-300 bg-white shadow-sm"
                        : "border-slate-200 bg-white/70 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`block truncate text-sm font-bold ${ativo ? "text-emerald-800" : "text-slate-800"}`}>
                          {integrador.nome}
                        </span>
                        <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{integrador.contato || "Contato nao informado"}</span>
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {totalProjetos}
                      </span>
                    </div>
                  </button>
                );
              })}
              {integradoresFiltrados.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-sm text-slate-500">
                  Nenhum integrador encontrado.
                </div>
              )}
            </div>
          </aside>
          )}

          {mostrarDocumentos && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Documentos solicitados no portal</h2>
                  <p className="text-xs text-slate-500">Esses campos aparecem no envio de novo projeto do integrador.</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                  {documentosAtivos.length} ativos
                </span>
              </div>

              <form onSubmit={handleCriarDocumento} className="mb-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_140px_auto_auto]">
                <input
                  required
                  value={novoDocumentoNome}
                  onChange={event => setNovoDocumentoNome(event.target.value)}
                  placeholder="Nome do documento"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
                />
                <select
                  value={novoDocumentoTipo}
                  onChange={event => setNovoDocumentoTipo(event.target.value as "pdf" | "foto")}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="pdf">PDF</option>
                  <option value="foto">Imagem</option>
                </select>
                <label className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={novoDocumentoObrigatorio}
                    onChange={event => setNovoDocumentoObrigatorio(event.target.checked)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Obrigatorio
                </label>
                <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </form>

              <div className="grid gap-2 md:grid-cols-2">
                {documentosPortal.map(documento => (
                  <div key={documento.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${documento.ativo ? "border-slate-200 bg-white" : "border-slate-200 bg-white/60 opacity-70"}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${documento.tipo === "pdf" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {documento.tipo === "pdf" ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-800">{documento.nome}</h3>
                        <p className="text-xs text-slate-500">
                          {documento.tipo === "pdf" ? "PDF" : "Imagem"} {documento.obrigatorio ? "- obrigatorio" : "- opcional"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => alternarDocumentoPortal(documento.id)}
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${documento.ativo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {documento.ativo ? "Ativo" : "Inativo"}
                      </button>
                      <button
                        type="button"
                        onClick={() => alternarObrigatoriedadeDocumentoPortal(documento.id)}
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${documento.obrigatorio ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {documento.obrigatorio ? "Obrigatorio" : "Opcional"}
                      </button>
                      <button type="button" onClick={() => removerDocumentoPortal(documento.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remover documento">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
            clientes={clientesDoIntegrador.filter(cliente => cliente.status_id === coluna.id)}
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
        documentoEmDownloadId={documentoEmDownloadId}
        enviandoDatasheet={enviandoDatasheet}
        gerandoProcuracao={gerandoProcuracaoId === clienteSelecionado?.id}
        documentosPortal={documentosPortal}
        onClose={() => setClienteSelecionadoId(null)}
        onClienteChange={atualizarCliente}
        onRecalcularDemanda={recalcularDemanda}
        onGerarProcuracao={gerarProcuracao}
        onToggleChecklist={alternarChecklist}
        onToggleDatasheet={alternarDatasheet}
        onBaixarDatasheet={baixarDatasheet}
        onBaixarDocumentoProjeto={baixarDocumentoProjeto}
        onCadastrarDatasheet={cadastrarDatasheet}
        onCamposAdicionaisChange={atualizarCamposAdicionais}
        onEquipamentosChange={atualizarEquipamentos}
        onBeneficiariasChange={atualizarBeneficiarias}
        onAdicionarChecklistItem={adicionarChecklistItem}
        onAtualizarChecklistItem={atualizarChecklistItem}
        onRemoverChecklistItem={removerChecklistItem}
      />
    </section>
  );
}

function PortalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-lg font-bold text-slate-800">{value}</span>
    </div>
  );
}
