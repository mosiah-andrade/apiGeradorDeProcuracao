"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileUp, Image as ImageIcon, Send, SolarPanel, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  checklistPadraoHomologacao,
  type HomologacaoDocumentoConfig,
  type HomologacaoIntegrador,
  type HomologacaoCard,
  type HomologacaoStatus,
  type HomologacaoBeneficiaria,
  type HomologacaoCampoAdicional,
  type HomologacaoEquipamento,
} from "@/app/kanban/homologacao/mockData";

interface NovoProjetoPortal {
  nome: string;
  titular: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  rg: string;
  orgaoEmissor: string;
  endereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  unidadeConsumidora: string;
  concessionaria: string;
  potenciaKWp: string;
}

const formularioInicial: NovoProjetoPortal = {
  nome: "",
  titular: "",
  email: "",
  telefone: "",
  cpfCnpj: "",
  rg: "",
  orgaoEmissor: "",
  endereco: "",
  bairro: "",
  cep: "",
  cidade: "",
  estado: "",
  unidadeConsumidora: "",
  concessionaria: "",
  potenciaKWp: "",
};

interface HomologacaoProjetoRow {
  id: string;
  integrador_id: string;
  status_id: string | null;
  nome: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  cpf_cnpj: string | null;
  rg: string | null;
  orgao_emissor: string | null;
  endereco: string | null;
  bairro: string | null;
  cep: string | null;
  concessionaria: string | null;
  cidade_concessionaria: string | null;
  cnpj_concessionaria: string | null;
  unidade_consumidora: string | null;
  titular: string | null;
  representante: string | null;
  cpf_representante: string | null;
  contratado_nome: string | null;
  contratado_cpf: string | null;
  contratado_rg: string | null;
  contratado_orgao_emissor: string | null;
  contratado_endereco: string | null;
  consumo_medio_kwh: number | string | null;
  potencia_kwp: number | string | null;
  demanda_calculada_kw: number | string | null;
  tipo_ligacao: HomologacaoCard["tipoLigacao"] | null;
  protocolo: string | null;
  prazo: string | null;
  responsavel: string | null;
  procuracao_gerada: boolean | null;
  equipamentos: unknown;
  datasheets: unknown;
  checklist: unknown;
  campos_adicionais: unknown;
  beneficiarias: unknown;
  metodo_rateio: HomologacaoCard["metodoRateio"] | null;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function projetoDoBanco(row: HomologacaoProjetoRow): HomologacaoCard {
  return {
    id: row.id,
    integradorId: row.integrador_id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    status_id: row.status_id,
    cidade: row.cidade,
    estado: row.estado,
    cpfCnpj: row.cpf_cnpj || "",
    rg: row.rg || "",
    orgaoEmissor: row.orgao_emissor || "",
    endereco: row.endereco || "",
    bairro: row.bairro || "",
    cep: row.cep || "",
    concessionaria: row.concessionaria || "",
    cidadeConcessionaria: row.cidade_concessionaria || "",
    cnpjConcessionaria: row.cnpj_concessionaria || "",
    unidadeConsumidora: row.unidade_consumidora || "",
    titular: row.titular || "",
    representante: row.representante || "",
    cpfRepresentante: row.cpf_representante || "",
    contratadoNome: row.contratado_nome || "Asaweb Energia Solar",
    contratadoCpf: row.contratado_cpf || "00.000.000/0001-00",
    contratadoRg: row.contratado_rg || "",
    contratadoOrgaoEmissor: row.contratado_orgao_emissor || "",
    contratadoEndereco: row.contratado_endereco || "",
    consumoMedioKwh: Number(row.consumo_medio_kwh || 0),
    potenciaKWp: Number(row.potencia_kwp || 0),
    demandaCalculadaKw: Number(row.demanda_calculada_kw || 0),
    tipoLigacao: row.tipo_ligacao || "Bifasico",
    protocolo: row.protocolo,
    prazo: row.prazo || "Recebido pelo portal",
    responsavel: row.responsavel || "Homologador",
    procuracaoGerada: Boolean(row.procuracao_gerada),
    equipamentos: asArray<HomologacaoEquipamento>(row.equipamentos),
    datasheets: asArray<string>(row.datasheets),
    checklist: asArray(row.checklist).length > 0 ? asArray(row.checklist) : checklistPadraoHomologacao,
    camposAdicionais: asArray<HomologacaoCampoAdicional>(row.campos_adicionais),
    beneficiarias: asArray<HomologacaoBeneficiaria>(row.beneficiarias),
    metodoRateio: row.metodo_rateio || "porcentagem",
    documentosUploads: [],
  };
}

export default function PortalIntegradorPage({
  params,
  searchParams,
}: {
  params: Promise<{ integradorId: string }>;
  searchParams: Promise<{ nome?: string; contato?: string; docs?: string }>;
}) {
  const { integradorId } = use(params);
  const { token = "" } = use(searchParams);
  const [integrador, setIntegrador] = useState<(HomologacaoIntegrador & { user_id?: string }) | null>(null);
  const [documentosSolicitados, setDocumentosSolicitados] = useState<HomologacaoDocumentoConfig[]>([]);
  const [statusDisponiveis, setStatusDisponiveis] = useState<HomologacaoStatus[]>([]);
  const [projetos, setProjetos] = useState<HomologacaoCard[]>([]);
  const [formulario, setFormulario] = useState<NovoProjetoPortal>(formularioInicial);
  const [arquivos, setArquivos] = useState<Record<string, File | null>>({});
  const [arquivosExtras, setArquivosExtras] = useState<File[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function carregarPortal() {
    setCarregando(true);

    try {
      const resposta = await fetch(`/api/portal-integrador/${integradorId}?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      if (!resposta.ok) throw new Error("Portal não encontrado");
      const dados = await resposta.json();
      setIntegrador({ id: integradorId, nome: dados.integrador.nome, contato: dados.integrador.contato, linkAcesso: "" });
      setDocumentosSolicitados(dados.documentos || []);
      const nomesDeStatus = new Set<string>();
      setStatusDisponiveis((dados.status || []).filter((status: HomologacaoStatus) => {
        const nome = status.nome.trim().toLowerCase();
        if (nomesDeStatus.has(nome)) return false;
        nomesDeStatus.add(nome);
        return true;
      }));
      setProjetos((dados.projetos || []).map(projetoDoBanco));
    } catch (error) {
      console.error("Erro ao carregar portal do integrador:", error);
      setIntegrador(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregarPortal();
    // Portal publico sincroniza os dados do Supabase ao abrir o link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integradorId, token]);

  useEffect(() => {
    const intervalo = window.setInterval(() => void carregarPortal(), 30_000);
    return () => window.clearInterval(intervalo);
    // Atualiza o acompanhamento quando o homologador altera o status.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integradorId, token]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Carregando portal...</h1>
        </section>
      </main>
    );
  }

  if (!integrador) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Acesso nao encontrado</h1>
          <p className="mt-2 text-sm text-slate-500">Confira o link enviado pelo homologador.</p>
        </section>
      </main>
    );
  }

  function atualizarFormulario(campo: keyof NovoProjetoPortal, valor: string) {
    setFormulario(formularioAtual => ({ ...formularioAtual, [campo]: valor }));
  }

  async function enviarProjeto(event: React.FormEvent) {
    event.preventDefault();
    if (enviando) return;

    setEnviando(true);

    try {
      const dados = new FormData();
      dados.set("token", token);
      Object.entries(formulario).forEach(([chave, valor]) => dados.set(chave, valor));
      dados.set("camposAdicionais", JSON.stringify([{ id: "origem", nome: "Origem", valor: "Portal do integrador" }]));
      dados.set("beneficiarias", "[]");
      Object.entries(arquivos).forEach(([documentoId, arquivo]) => {
        if (arquivo) dados.append("arquivo", new File([arquivo], `${documentoId}__${arquivo.name}`, { type: arquivo.type }));
      });
      arquivosExtras.forEach(arquivo => dados.append("arquivo", new File([arquivo], `extra__${arquivo.name}`, { type: arquivo.type })));
      const resposta = await fetch(`/api/portal-integrador/${integradorId}`, { method: "POST", body: dados });
      const retorno = await resposta.json();
      if (!resposta.ok) throw new Error(retorno.erro);
      setProjetos([{ id: retorno.projeto.id, integradorId, nome: retorno.projeto.nome, email: null, telefone: null, status_id: retorno.projeto.status_id, cidade: null, estado: null, cpfCnpj: "", rg: "", orgaoEmissor: "", endereco: "", bairro: "", cep: "", concessionaria: formulario.concessionaria, cidadeConcessionaria: "", cnpjConcessionaria: "", unidadeConsumidora: formulario.unidadeConsumidora, titular: formulario.titular, representante: "", cpfRepresentante: "", contratadoNome: "", contratadoCpf: "", contratadoRg: "", contratadoOrgaoEmissor: "", contratadoEndereco: "", consumoMedioKwh: 0, potenciaKWp: Number(formulario.potenciaKWp) || 0, demandaCalculadaKw: 0, tipoLigacao: "Bifasico", protocolo: null, prazo: retorno.projeto.prazo, responsavel: "", procuracaoGerada: false, equipamentos: [], datasheets: [], checklist: [], camposAdicionais: [], beneficiarias: [], metodoRateio: "porcentagem", documentosUploads: [] }]);
      setFormulario(formularioInicial);
      setArquivos({});
      setArquivosExtras([]);
      toast.success("Projeto recebido com sucesso.", { description: "Ele já está disponível para homologação." });
    } catch (error) {
      console.error("Erro ao enviar projeto:", error);
      toast.error("Não foi possível enviar o projeto.", { description: "Revise os dados e tente novamente." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <SolarPanel className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Portal do integrador</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{integrador.nome}</h1>
            <p className="text-sm text-slate-500">{integrador.contato || "Acompanhe seus projetos de homologacao"}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-2">
            <Metric label="Projetos" value={projetos.length.toString()} />
            <Metric label="Recebidos" value={projetos.filter(projeto => projeto.status_id === "recebido").length.toString()} />
            <Metric label="Aprovados" value={projetos.filter(projeto => projeto.status_id === "aprovado").length.toString()} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={enviarProjeto} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileUp className="h-5 w-5 text-emerald-700" />
            <h2 className="font-bold text-slate-800">Enviar novo projeto</h2>
          </div>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
            <span className="text-sm font-semibold text-blue-800">Status inicial do projeto</span>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
              {statusDisponiveis.find(status => status.nome.toLowerCase().trim() === "recebido")?.nome || "Recebido"}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PortalInput label="Projeto" value={formulario.nome} onChange={valor => atualizarFormulario("nome", valor)} required />
            <PortalInput label="Titular" value={formulario.titular} onChange={valor => atualizarFormulario("titular", valor)} required />
            <PortalInput label="E-mail" value={formulario.email} onChange={valor => atualizarFormulario("email", valor)} />
            <PortalInput label="Telefone" value={formulario.telefone} onChange={valor => atualizarFormulario("telefone", valor)} />
            <PortalInput label="CPF/CNPJ" value={formulario.cpfCnpj} onChange={valor => atualizarFormulario("cpfCnpj", valor)} required />
            <PortalInput label="RG" value={formulario.rg} onChange={valor => atualizarFormulario("rg", valor)} />
            <PortalInput label="Órgão emissor" value={formulario.orgaoEmissor} onChange={valor => atualizarFormulario("orgaoEmissor", valor)} />
            <PortalInput label="CEP" value={formulario.cep} onChange={valor => atualizarFormulario("cep", valor)} />
            <PortalInput label="Endereço" value={formulario.endereco} onChange={valor => atualizarFormulario("endereco", valor)} required />
            <PortalInput label="Bairro" value={formulario.bairro} onChange={valor => atualizarFormulario("bairro", valor)} />
            <PortalInput label="Cidade" value={formulario.cidade} onChange={valor => atualizarFormulario("cidade", valor)} required />
            <PortalInput label="Estado" value={formulario.estado} onChange={valor => atualizarFormulario("estado", valor)} />
            <PortalInput label="Unidade consumidora" value={formulario.unidadeConsumidora} onChange={valor => atualizarFormulario("unidadeConsumidora", valor)} required />
            <PortalInput label="Concessionaria" value={formulario.concessionaria} onChange={valor => atualizarFormulario("concessionaria", valor)} />
            <PortalInput label="Potencia kWp" value={formulario.potenciaKWp} onChange={valor => atualizarFormulario("potenciaKWp", valor)} type="number" />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileUp className="h-5 w-5 text-emerald-700" />
              <h3 className="font-bold text-slate-800">Documentacoes do projeto</h3>
            </div>
            <div className="space-y-2">
              {documentosSolicitados.map(documento => {
                const arquivo = arquivos[documento.id];

                return (
                  <label key={documento.id} className="flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${documento.tipo === "pdf" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                        {documento.tipo === "pdf" ? <FileUp className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-slate-800">
                          {documento.nome} {documento.obrigatorio && <span className="text-red-500">*</span>}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {arquivo ? arquivo.name : documento.tipo === "pdf" ? "Aceita arquivo PDF" : "Aceita JPG ou PNG"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700">
                      {arquivo ? "Alterar arquivo" : "Anexar"}
                    </span>
                    <input
                      type="file"
                      required={documento.obrigatorio}
                      accept={documento.tipo === "pdf" ? "application/pdf" : "image/jpeg,image/png"}
                      onChange={event => {
                        const arquivoSelecionado = event.target.files?.[0] || null;
                        setArquivos(arquivosAtuais => ({ ...arquivosAtuais, [documento.id]: arquivoSelecionado }));
                      }}
                      className="hidden"
                    />
                  </label>
                );
              })}
              {documentosSolicitados.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
                  Nenhuma documentacao foi solicitada.
                </div>
              )}
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-3">
                <span className="text-sm font-semibold text-blue-800">Anexos complementares</span>
                <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700">Adicionar arquivos</span>
                <input type="file" multiple onChange={event => setArquivosExtras(Array.from(event.target.files || []))} className="hidden" />
              </label>
              {arquivosExtras.length > 0 && <p className="text-xs font-medium text-slate-500">{arquivosExtras.length} anexo(s) complementar(es) selecionado(s).</p>}
            </div>
          </div>

          <button type="submit" disabled={enviando} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            <Send className="h-4 w-4" />
            {enviando ? "Enviando..." : "Enviar para homologacao"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-emerald-700" />
            <h2 className="font-bold text-slate-800">Acompanhar projetos</h2>
          </div>
          <div className="space-y-3">
            {projetos.map(projeto => {
              const status = statusDisponiveis.find(coluna => coluna.id === projeto.status_id);

              return (
                <article key={projeto.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-900">{projeto.nome}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <UserRound className="h-3.5 w-3.5" />
                        {projeto.titular || "Titular pendente"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: status?.cor || "var(--color-neutral-500)" }}>
                      {status?.nome || "Sem status"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <SmallInfo label="UC" value={projeto.unidadeConsumidora || "Pendente"} />
                    <SmallInfo label="Concessionaria" value={projeto.concessionaria || "Pendente"} />
                    <SmallInfo label="Prazo" value={projeto.prazo} />
                  </div>
                  {projeto.status_id === "aprovado" && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Projeto aprovado
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-lg font-bold text-slate-900">{value}</span>
    </div>
  );
}

function PortalInput({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="rounded-xl bg-slate-50 px-3 py-2">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none"
      />
    </label>
  );
}

function SmallInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="block truncate text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}
