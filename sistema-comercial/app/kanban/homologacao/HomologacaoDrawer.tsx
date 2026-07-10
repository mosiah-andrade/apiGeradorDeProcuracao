"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  Check,
  ClipboardSignature,
  Download,
  FileText,
  Library,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

import type {
  HomologacaoBeneficiaria,
  HomologacaoCampoAdicional,
  HomologacaoCard,
  HomologacaoDatasheet,
  HomologacaoDocumentoConfig,
  HomologacaoDocumentoUpload,
  HomologacaoEquipamento,
} from "./mockData";

interface NovoDatasheetInput {
  fabricante: string;
  modelo: string;
  potencia_kw: number;
  tags: string[];
  arquivo: File;
}

interface HomologacaoDrawerProps {
  cliente: HomologacaoCard | null;
  datasheetsDisponiveis: HomologacaoDatasheet[];
  carregandoDatasheets: boolean;
  datasheetEmDownloadId: string | null;
  documentoEmDownloadId: string | null;
  enviandoDatasheet: boolean;
  gerandoProcuracao: boolean;
  documentosPortal: HomologacaoDocumentoConfig[];
  onClose: () => void;
  onClienteChange: (cliente: HomologacaoCard) => void;
  onRecalcularDemanda: (clienteId: string) => void;
  onGerarProcuracao: (clienteId: string) => void;
  onToggleChecklist: (clienteId: string, checklistId: string) => void;
  onToggleDatasheet: (clienteId: string, datasheetId: string) => void;
  onBaixarDatasheet: (datasheet: HomologacaoDatasheet) => void;
  onBaixarDocumentoProjeto: (documento: HomologacaoDocumentoUpload) => void;
  onCadastrarDatasheet: (input: NovoDatasheetInput) => Promise<void>;
  onCamposAdicionaisChange: (clienteId: string, campos: HomologacaoCampoAdicional[]) => void;
  onEquipamentosChange: (clienteId: string, equipamentos: HomologacaoEquipamento[]) => void;
  onBeneficiariasChange: (clienteId: string, beneficiarias: HomologacaoBeneficiaria[]) => void;
  onAdicionarChecklistItem: (clienteId: string, label: string) => void;
  onAtualizarChecklistItem: (clienteId: string, checklistId: string, label: string) => void;
  onRemoverChecklistItem: (clienteId: string, checklistId: string) => void;
}

export function HomologacaoDrawer({
  cliente,
  datasheetsDisponiveis,
  carregandoDatasheets,
  datasheetEmDownloadId,
  documentoEmDownloadId,
  enviandoDatasheet,
  gerandoProcuracao,
  documentosPortal,
  onClose,
  onClienteChange,
  onRecalcularDemanda,
  onGerarProcuracao,
  onToggleChecklist,
  onToggleDatasheet,
  onBaixarDatasheet,
  onBaixarDocumentoProjeto,
  onCadastrarDatasheet,
  onCamposAdicionaisChange,
  onEquipamentosChange,
  onBeneficiariasChange,
  onAdicionarChecklistItem,
  onAtualizarChecklistItem,
  onRemoverChecklistItem,
}: HomologacaoDrawerProps) {
  const [buscaDatasheet, setBuscaDatasheet] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [modelo, setModelo] = useState("");
  const [potencia, setPotencia] = useState("");
  const [tags, setTags] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [novoChecklist, setNovoChecklist] = useState("");

  const datasheetsFiltrados = useMemo(() => {
    const termo = buscaDatasheet.toLowerCase().trim();
    const selecionados = datasheetsDisponiveis.filter(datasheet =>
      cliente?.datasheets.includes(datasheet.id)
    );

    if (!termo) return selecionados;

    return datasheetsDisponiveis.filter(datasheet =>
      datasheet.fabricante?.toLowerCase().includes(termo) ||
      datasheet.modelo?.toLowerCase().includes(termo) ||
      datasheet.tags?.some(tag => tag.toLowerCase().includes(termo))
    );
  }, [buscaDatasheet, datasheetsDisponiveis, cliente?.datasheets]);

  if (!cliente) return null;

  const datasheetsSelecionados = datasheetsDisponiveis.filter(datasheet =>
    cliente.datasheets.includes(datasheet.id)
  );
  const documentosAtivos = documentosPortal.filter(documento => documento.ativo);
  const anexosSemRegraAtiva = cliente.documentosUploads.filter(upload =>
    !upload.documentoConfigId || !documentosAtivos.some(documento => documento.id === upload.documentoConfigId)
  );
  const documentosObrigatoriosPendentes = documentosAtivos.filter(documento =>
    documento.obrigatorio && !cliente.documentosUploads.some(upload => upload.documentoConfigId === documento.id)
  ).length;
  const checklistConcluido = cliente.checklist.filter(item => item.done).length;

  async function handleCadastrarDatasheet(event: React.FormEvent) {
    event.preventDefault();
    if (!arquivo) {
      alert("Selecione um PDF para anexar.");
      return;
    }

    try {
      await onCadastrarDatasheet({
        fabricante: fabricante.trim(),
        modelo: modelo.trim(),
        potencia_kw: Number(potencia),
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
        arquivo,
      });

      setFabricante("");
      setModelo("");
      setPotencia("");
      setTags("");
      setArquivo(null);
    } catch {
      return;
    }
  }

  function atualizarCampoAdicional(index: number, campo: HomologacaoCampoAdicional) {
    if (!cliente) return;
    const campos = [...cliente.camposAdicionais];
    campos[index] = campo;
    onCamposAdicionaisChange(cliente.id, campos);
  }

  function removerCampoAdicional(index: number) {
    if (!cliente) return;
    onCamposAdicionaisChange(cliente.id, cliente.camposAdicionais.filter((_, itemIndex) => itemIndex !== index));
  }

  function adicionarCampoAdicional() {
    if (!cliente) return;
    onCamposAdicionaisChange(cliente.id, [
      ...cliente.camposAdicionais,
      { id: `campo-${Date.now()}`, nome: "Novo campo", valor: "" },
    ]);
  }

  function adicionarEquipamento() {
    if (!cliente) return;
    onEquipamentosChange(cliente.id, [
      ...cliente.equipamentos,
      { tipo: "Modulo", modelo: "", quantidade: 1 },
    ]);
  }

  function removerEquipamento(index: number) {
    if (!cliente) return;
    onEquipamentosChange(cliente.id, cliente.equipamentos.filter((_, itemIndex) => itemIndex !== index));
  }

  function adicionarBeneficiaria() {
    if (!cliente) return;
    onBeneficiariasChange(cliente.id, [
      ...cliente.beneficiarias,
      {
        id: `beneficiaria-${Date.now()}`,
        nome: "Nova beneficiaria",
        unidadeConsumidora: "",
        prioridade: cliente.beneficiarias.length + 1,
        porcentagem: 0,
      },
    ]);
  }

  function atualizarBeneficiaria(index: number, beneficiaria: HomologacaoBeneficiaria) {
    if (!cliente) return;
    const beneficiarias = [...cliente.beneficiarias];
    beneficiarias[index] = beneficiaria;
    onBeneficiariasChange(cliente.id, beneficiarias);
  }

  function removerBeneficiaria(index: number) {
    if (!cliente) return;
    onBeneficiariasChange(cliente.id, cliente.beneficiarias.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Ficha de homologacao</span>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{cliente.nome}</h2>
            <p className="text-sm text-slate-500">
              {cliente.concessionaria} - {cliente.unidadeConsumidora}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Fechar ficha"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-4 font-bold text-slate-800">Informacoes do cliente</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="Projeto" value={cliente.nome} onChange={value => onClienteChange({ ...cliente, nome: value })} />
              <TextInput label="Titular" value={cliente.titular} onChange={value => onClienteChange({ ...cliente, titular: value })} />
              <TextInput label="E-mail" value={cliente.email || ""} onChange={value => onClienteChange({ ...cliente, email: value })} />
              <TextInput label="Telefone" value={cliente.telefone || ""} onChange={value => onClienteChange({ ...cliente, telefone: value })} />
              <TextInput label="CPF/CNPJ" value={cliente.cpfCnpj} onChange={value => onClienteChange({ ...cliente, cpfCnpj: value })} />
              <TextInput label="RG" value={cliente.rg} onChange={value => onClienteChange({ ...cliente, rg: value })} />
              <TextInput label="Orgao emissor" value={cliente.orgaoEmissor} onChange={value => onClienteChange({ ...cliente, orgaoEmissor: value })} />
              <TextInput label="Endereco" value={cliente.endereco} onChange={value => onClienteChange({ ...cliente, endereco: value })} />
              <TextInput label="Bairro" value={cliente.bairro} onChange={value => onClienteChange({ ...cliente, bairro: value })} />
              <TextInput label="CEP" value={cliente.cep} onChange={value => onClienteChange({ ...cliente, cep: value })} />
              <TextInput label="Cidade" value={cliente.cidade || ""} onChange={value => onClienteChange({ ...cliente, cidade: value })} />
              <TextInput label="Estado" value={cliente.estado || ""} onChange={value => onClienteChange({ ...cliente, estado: value })} />
              <TextInput label="Concessionaria" value={cliente.concessionaria} onChange={value => onClienteChange({ ...cliente, concessionaria: value })} />
              <TextInput label="Cidade da concessionaria" value={cliente.cidadeConcessionaria} onChange={value => onClienteChange({ ...cliente, cidadeConcessionaria: value })} />
              <TextInput label="CNPJ da concessionaria" value={cliente.cnpjConcessionaria} onChange={value => onClienteChange({ ...cliente, cnpjConcessionaria: value })} />
              <TextInput label="Unidade consumidora" value={cliente.unidadeConsumidora} onChange={value => onClienteChange({ ...cliente, unidadeConsumidora: value })} />
              <TextInput label="Protocolo" value={cliente.protocolo || ""} onChange={value => onClienteChange({ ...cliente, protocolo: value || null })} />
              <TextInput label="Prazo" value={cliente.prazo} onChange={value => onClienteChange({ ...cliente, prazo: value })} />
              <TextInput label="Responsavel" value={cliente.responsavel} onChange={value => onClienteChange({ ...cliente, responsavel: value })} />
              <label className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Tipo de ligacao</span>
                <select
                  value={cliente.tipoLigacao}
                  onChange={event => onClienteChange({ ...cliente, tipoLigacao: event.target.value as HomologacaoCard["tipoLigacao"] })}
                  className="mt-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
                >
                  <option value="Monofasico">Monofasico</option>
                  <option value="Bifasico">Bifasico</option>
                  <option value="Trifasico">Trifasico</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800">Campos adicionais</h3>
              <button
                type="button"
                onClick={adicionarCampoAdicional}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                <Plus className="h-4 w-4" />
                Adicionar campo
              </button>
            </div>
            <div className="space-y-2">
              {cliente.camposAdicionais.map((campo, index) => (
                <div key={campo.id} className="grid gap-2 rounded-lg bg-slate-50 p-2 sm:grid-cols-[1fr_1.5fr_auto]">
                  <input
                    value={campo.nome}
                    onChange={event => atualizarCampoAdicional(index, { ...campo, nome: event.target.value })}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                  />
                  <input
                    value={campo.valor}
                    onChange={event => atualizarCampoAdicional(index, { ...campo, valor: event.target.value })}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                  <button type="button" onClick={() => removerCampoAdicional(index)} className="rounded-lg bg-white p-2 text-slate-400 hover:text-red-600" aria-label="Remover campo">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {cliente.camposAdicionais.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                  Nenhum campo adicional criado.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-700" />
                <h3 className="font-bold text-slate-800">Calculo de demanda</h3>
              </div>
              <button
                type="button"
                onClick={() => onRecalcularDemanda(cliente.id)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Recalcular
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberInput
                label="Consumo medio"
                suffix="kWh"
                value={cliente.consumoMedioKwh}
                onChange={value => onClienteChange({ ...cliente, consumoMedioKwh: value })}
              />
              <NumberInput
                label="Potencia"
                suffix="kWp"
                value={cliente.potenciaKWp}
                onChange={value => onClienteChange({ ...cliente, potenciaKWp: value })}
              />
              <Info label="Demanda calculada" value={`${cliente.demandaCalculadaKw} kW`} strong />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardSignature className="h-5 w-5 text-emerald-700" />
                <h3 className="font-bold text-slate-800">Procuracao</h3>
              </div>
              <button
                type="button"
                onClick={() => onGerarProcuracao(cliente.id)}
                disabled={gerandoProcuracao}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
              >
                {gerandoProcuracao ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {gerandoProcuracao ? "Gerando..." : cliente.procuracaoGerada ? "Gerar novamente" : "Gerar procuracao"}
              </button>
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <TextInput label="Representante" value={cliente.representante} onChange={value => onClienteChange({ ...cliente, representante: value })} />
              <TextInput label="CPF do representante" value={cliente.cpfRepresentante} onChange={value => onClienteChange({ ...cliente, cpfRepresentante: value })} />
              <TextInput label="Contratado" value={cliente.contratadoNome} onChange={value => onClienteChange({ ...cliente, contratadoNome: value })} />
              <TextInput label="CPF/CNPJ contratado" value={cliente.contratadoCpf} onChange={value => onClienteChange({ ...cliente, contratadoCpf: value })} />
              <TextInput label="RG contratado" value={cliente.contratadoRg} onChange={value => onClienteChange({ ...cliente, contratadoRg: value })} />
              <TextInput label="Orgao emissor contratado" value={cliente.contratadoOrgaoEmissor} onChange={value => onClienteChange({ ...cliente, contratadoOrgaoEmissor: value })} />
              <div className="sm:col-span-2">
                <TextInput label="Endereco contratado" value={cliente.contratadoEndereco} onChange={value => onClienteChange({ ...cliente, contratadoEndereco: value })} />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {cliente.procuracaoGerada ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  Procuracao gerada pelo sistema de documentos.
                </>
              ) : (
                "A procuracao sera gerada pela API de documentos existente."
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Library className="h-5 w-5 text-emerald-700" />
                <h3 className="font-bold text-slate-800">Biblioteca de datasheets</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {datasheetsSelecionados.length} anexados
              </span>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buscaDatasheet}
                onChange={event => setBuscaDatasheet(event.target.value)}
                placeholder="Buscar para adicionar outros datasheets..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="mb-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {carregandoDatasheets ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-8 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando biblioteca...
                </div>
              ) : datasheetsFiltrados.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                  Nenhum datasheet encontrado.
                </div>
              ) : (
                datasheetsFiltrados.map(datasheet => {
                  const selecionado = cliente.datasheets.includes(datasheet.id);
                  const baixando = datasheetEmDownloadId === datasheet.id;

                  return (
                    <div
                      key={datasheet.id}
                      className={`rounded-lg border px-3 py-2 transition-colors ${
                        selecionado
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleDatasheet(cliente.id, datasheet.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span className="block truncate text-sm font-semibold text-slate-800">
                            {datasheet.fabricante} {datasheet.modelo}
                          </span>
                          <span className="text-xs text-slate-500">
                            Inversor - {datasheet.potencia_kw} kW
                          </span>
                          {datasheet.tags && datasheet.tags.length > 0 && (
                            <span className="mt-1 flex flex-wrap gap-1">
                              {datasheet.tags.map(tag => (
                                <span key={tag} className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                  #{tag}
                                </span>
                              ))}
                            </span>
                          )}
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onToggleDatasheet(cliente.id, datasheet.id)}
                            className={`rounded-lg p-2 transition-colors ${
                              selecionado ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                            aria-label={selecionado ? "Remover datasheet do projeto" : "Anexar datasheet ao projeto"}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onBaixarDatasheet(datasheet)}
                            disabled={baixando}
                            className="rounded-lg bg-slate-900 p-2 text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
                            aria-label="Baixar datasheet"
                          >
                            {baixando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleCadastrarDatasheet} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
              <div className="mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-700">Adicionar PDF do computador</h4>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input required value={fabricante} onChange={event => setFabricante(event.target.value)} placeholder="Fabricante" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
                <input required value={modelo} onChange={event => setModelo(event.target.value)} placeholder="Modelo" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
                <input required type="number" step="0.01" min="0" value={potencia} onChange={event => setPotencia(event.target.value)} placeholder="Potencia kW" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
                <input value={tags} onChange={event => setTags(event.target.value)} placeholder="Tags separadas por virgula" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
                <input required type="file" accept=".pdf,application/pdf" onChange={event => setArquivo(event.target.files?.[0] || null)} className="sm:col-span-2 rounded-lg border border-slate-200 bg-white p-2 text-sm" />
              </div>
              <button
                type="submit"
                disabled={enviandoDatasheet}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {enviandoDatasheet ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Anexar na biblioteca
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-700" />
                <h3 className="font-bold text-slate-800">Documentos do projeto</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                documentosObrigatoriosPendentes === 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}>
                {documentosObrigatoriosPendentes === 0 ? "Obrigatorios ok" : `${documentosObrigatoriosPendentes} pendente(s)`}
              </span>
            </div>

            <div className="space-y-2">
              {documentosAtivos.map(documento => {
                const anexo = cliente.documentosUploads.find(upload => upload.documentoConfigId === documento.id);
                const baixando = anexo ? documentoEmDownloadId === anexo.id : false;

                return (
                  <div key={documento.id} className={`rounded-lg border px-3 py-2 ${
                    anexo ? "border-emerald-200 bg-emerald-50" : documento.obrigatorio ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
                  }`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-sm font-bold text-slate-800">{documento.nome}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            documento.obrigatorio ? "bg-red-100 text-red-700" : "bg-white text-slate-500"
                          }`}>
                            {documento.obrigatorio ? "Obrigatorio" : "Opcional"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {anexo ? `Recebido: ${anexo.nome}` : documento.tipo === "pdf" ? "Aguardando PDF" : "Aguardando imagem"}
                        </p>
                      </div>
                      {anexo ? (
                        <button
                          type="button"
                          onClick={() => onBaixarDocumentoProjeto(anexo)}
                          disabled={baixando}
                          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                        >
                          {baixando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          Baixar
                        </button>
                      ) : (
                        <span className="rounded-lg bg-white px-3 py-2 text-center text-xs font-bold text-slate-500">
                          Nao enviado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {anexosSemRegraAtiva.map(anexo => {
                const baixando = documentoEmDownloadId === anexo.id;

                return (
                  <div key={anexo.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-slate-800">{anexo.nome}</h4>
                      <p className="mt-1 text-xs text-slate-500">Anexo recebido fora da lista ativa</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onBaixarDocumentoProjeto(anexo)}
                      disabled={baixando}
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                      {baixando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      Baixar
                    </button>
                  </div>
                );
              })}

              {documentosAtivos.length === 0 && anexosSemRegraAtiva.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                  Nenhum documento solicitado no portal.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800">Checklist documental</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {checklistConcluido}/{cliente.checklist.length}
              </span>
            </div>
            <div className="space-y-2">
              {cliente.checklist.map(item => (
                <div
                  key={item.id}
                  className="grid gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 sm:grid-cols-[auto_1fr_auto]"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleChecklist(cliente.id, item.id)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <input
                    value={item.label}
                    onChange={event => onAtualizarChecklistItem(cliente.id, item.id, event.target.value)}
                    className="min-w-0 bg-transparent outline-none"
                  />
                  <button type="button" onClick={() => onRemoverChecklistItem(cliente.id, item.id)} className="text-slate-300 hover:text-red-600" aria-label="Remover item">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <form
              onSubmit={event => {
                event.preventDefault();
                onAdicionarChecklistItem(cliente.id, novoChecklist);
                setNovoChecklist("");
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={novoChecklist}
                onChange={event => setNovoChecklist(event.target.value)}
                placeholder="Novo item do checklist"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
              />
              <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Adicionar
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800">Equipamentos do projeto</h3>
              <button type="button" onClick={adicionarEquipamento} className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                <Plus className="h-4 w-4" />
                Equipamento
              </button>
            </div>
            <div className="space-y-2">
              {cliente.equipamentos.map((equipamento, index) => (
                <div
                  key={`${equipamento.tipo}-${index}`}
                  className="grid gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm sm:grid-cols-[1fr_90px_120px_auto]"
                >
                  <input
                    value={equipamento.modelo}
                    onChange={event => {
                      const equipamentos = [...cliente.equipamentos];
                      equipamentos[index] = { ...equipamento, modelo: event.target.value };
                      onClienteChange({ ...cliente, equipamentos });
                    }}
                    className="bg-transparent font-medium text-slate-700 outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={equipamento.quantidade}
                    onChange={event => {
                      const equipamentos = [...cliente.equipamentos];
                      equipamentos[index] = { ...equipamento, quantidade: Number(event.target.value) };
                      onClienteChange({ ...cliente, equipamentos });
                    }}
                    className="bg-transparent text-slate-600 outline-none"
                  />
                  <select
                    value={equipamento.tipo}
                    onChange={event => {
                      const equipamentos = [...cliente.equipamentos];
                      equipamentos[index] = { ...equipamento, tipo: event.target.value as typeof equipamento.tipo };
                      onClienteChange({ ...cliente, equipamentos });
                    }}
                    className="bg-transparent text-slate-600 outline-none"
                  >
                    <option value="Modulo">Modulo</option>
                    <option value="Inversor">Inversor</option>
                  </select>
                  <button type="button" onClick={() => removerEquipamento(index)} className="rounded-lg bg-white p-2 text-slate-400 hover:text-red-600" aria-label="Remover equipamento">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {cliente.equipamentos.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                  Nenhum equipamento adicionado.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-700" />
                <h3 className="font-bold text-slate-800">Beneficiarias e rateio</h3>
              </div>
              <div className="flex gap-2">
                <select
                  value={cliente.metodoRateio}
                  onChange={event => onClienteChange({ ...cliente, metodoRateio: event.target.value as HomologacaoCard["metodoRateio"] })}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="porcentagem">Por porcentagem</option>
                  <option value="prioridade">Por prioridade</option>
                </select>
                <button type="button" onClick={adicionarBeneficiaria} className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                  <Plus className="h-4 w-4" />
                  Beneficiaria
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {cliente.beneficiarias.map((beneficiaria, index) => (
                <div key={beneficiaria.id} className="grid gap-2 rounded-lg bg-slate-50 p-2 sm:grid-cols-[1fr_1fr_100px_auto]">
                  <input
                    value={beneficiaria.nome}
                    onChange={event => atualizarBeneficiaria(index, { ...beneficiaria, nome: event.target.value })}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                  />
                  <input
                    value={beneficiaria.unidadeConsumidora}
                    onChange={event => atualizarBeneficiaria(index, { ...beneficiaria, unidadeConsumidora: event.target.value })}
                    placeholder="Unidade consumidora"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={cliente.metodoRateio === "prioridade" ? beneficiaria.prioridade : beneficiaria.porcentagem}
                    onChange={event => {
                      const valor = Number(event.target.value);
                      atualizarBeneficiaria(index, cliente.metodoRateio === "prioridade"
                        ? { ...beneficiaria, prioridade: valor }
                        : { ...beneficiaria, porcentagem: valor }
                      );
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none"
                  />
                  <button type="button" onClick={() => removerBeneficiaria(index)} className="rounded-lg bg-white p-2 text-slate-400 hover:text-red-600" aria-label="Remover beneficiaria">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {cliente.beneficiarias.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                  Nenhuma beneficiaria adicionada.
                </div>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm ${strong ? "font-bold text-emerald-700" : "font-medium text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-lg bg-slate-50 px-3 py-2">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
      />
    </label>
  );
}

function NumberInput({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-lg bg-slate-50 px-3 py-2">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={value}
          onChange={event => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
        />
        <span className="text-xs font-semibold text-slate-400">{suffix}</span>
      </span>
    </label>
  );
}
