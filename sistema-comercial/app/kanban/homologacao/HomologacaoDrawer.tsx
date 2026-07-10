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
  Search,
  Upload,
  X,
} from "lucide-react";

import type { HomologacaoCard, HomologacaoDatasheet } from "./mockData";

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
  enviandoDatasheet: boolean;
  gerandoProcuracao: boolean;
  onClose: () => void;
  onClienteChange: (cliente: HomologacaoCard) => void;
  onRecalcularDemanda: (clienteId: string) => void;
  onGerarProcuracao: (clienteId: string) => void;
  onToggleChecklist: (clienteId: string, checklistId: string) => void;
  onToggleDatasheet: (clienteId: string, datasheetId: string) => void;
  onBaixarDatasheet: (datasheet: HomologacaoDatasheet) => void;
  onCadastrarDatasheet: (input: NovoDatasheetInput) => Promise<void>;
}

export function HomologacaoDrawer({
  cliente,
  datasheetsDisponiveis,
  carregandoDatasheets,
  datasheetEmDownloadId,
  enviandoDatasheet,
  gerandoProcuracao,
  onClose,
  onClienteChange,
  onRecalcularDemanda,
  onGerarProcuracao,
  onToggleChecklist,
  onToggleDatasheet,
  onBaixarDatasheet,
  onCadastrarDatasheet,
}: HomologacaoDrawerProps) {
  const [buscaDatasheet, setBuscaDatasheet] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [modelo, setModelo] = useState("");
  const [potencia, setPotencia] = useState("");
  const [tags, setTags] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  const datasheetsFiltrados = useMemo(() => {
    const termo = buscaDatasheet.toLowerCase().trim();
    if (!termo) return datasheetsDisponiveis;

    return datasheetsDisponiveis.filter(datasheet =>
      datasheet.fabricante?.toLowerCase().includes(termo) ||
      datasheet.modelo?.toLowerCase().includes(termo) ||
      datasheet.tags?.some(tag => tag.toLowerCase().includes(termo))
    );
  }, [buscaDatasheet, datasheetsDisponiveis]);

  if (!cliente) return null;

  const datasheetsSelecionados = datasheetsDisponiveis.filter(datasheet =>
    cliente.datasheets.includes(datasheet.id)
  );
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
                placeholder="Buscar na biblioteca por fabricante, modelo ou tag..."
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
              <h3 className="font-bold text-slate-800">Checklist documental</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {checklistConcluido}/{cliente.checklist.length}
              </span>
            </div>
            <div className="space-y-2">
              {cliente.checklist.map(item => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onToggleChecklist(cliente.id, item.id)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-4 font-bold text-slate-800">Equipamentos do projeto</h3>
            <div className="space-y-2">
              {cliente.equipamentos.map((equipamento, index) => (
                <div
                  key={`${equipamento.tipo}-${index}`}
                  className="grid gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm sm:grid-cols-[1fr_90px_120px]"
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
                </div>
              ))}
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
