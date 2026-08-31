"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  checklistPadraoHomologacao,
  type HomologacaoBeneficiaria,
  type HomologacaoCampoAdicional,
  type HomologacaoCard,
  type HomologacaoDatasheet,
  type HomologacaoDocumentoConfig,
  type HomologacaoDocumentoUpload,
  type HomologacaoEquipamento,
  type HomologacaoIntegrador,
  type HomologacaoStatus,
} from "../mockData";

const coresColunas = ["#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#0891b2", "#65a30d"];

const colunasPadraoHomologacao = [
  { nome: "Recebido", cor: "#2563eb", ordem: 1 },
  { nome: "Em analise", cor: "#7c3aed", ordem: 2 },
  { nome: "Aguardando Concessionaria", cor: "#f59e0b", ordem: 3 },
  { nome: "Aprovado", cor: "#16a34a", ordem: 4 },
];

const documentosPadraoHomologacao = [
  { nome: "Conta de luz atualizada", tipo: "pdf" as const, obrigatorio: true, ativo: true },
  { nome: "Procuracao assinada", tipo: "pdf" as const, obrigatorio: true, ativo: true },
  { nome: "Foto do padrao de entrada", tipo: "foto" as const, obrigatorio: false, ativo: true },
];

interface NovoDatasheetInput {
  fabricante: string;
  modelo: string;
  potencia_kw: number;
  tags: string[];
  arquivo: File;
}

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

interface HomologacaoDocumentoUploadRow {
  id: string;
  created_at: string;
  projeto_id: string;
  documento_config_id: string | null;
  nome: string;
  tipo: string;
  storage_path: string;
}

function montarLinkIntegrador(id: string, token?: string) {
  const path = `/integrador/${id}${token ? `?token=${token}` : ""}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function uploadDoBanco(row: HomologacaoDocumentoUploadRow): HomologacaoDocumentoUpload {
  return {
    id: row.id,
    projetoId: row.projeto_id,
    documentoConfigId: row.documento_config_id,
    nome: row.nome,
    tipo: row.tipo,
    storagePath: row.storage_path,
    createdAt: row.created_at,
  };
}

function projetoDoBanco(row: HomologacaoProjetoRow, documentosUploads: HomologacaoDocumentoUpload[] = []): HomologacaoCard {
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
    prazo: row.prazo || "Novo projeto",
    responsavel: row.responsavel || "",
    procuracaoGerada: Boolean(row.procuracao_gerada),
    equipamentos: asArray<HomologacaoEquipamento>(row.equipamentos),
    datasheets: asArray<string>(row.datasheets),
    checklist: asArray(row.checklist).length > 0 ? asArray(row.checklist) : checklistPadraoHomologacao,
    camposAdicionais: asArray<HomologacaoCampoAdicional>(row.campos_adicionais),
    beneficiarias: asArray<HomologacaoBeneficiaria>(row.beneficiarias),
    metodoRateio: row.metodo_rateio || "porcentagem",
    documentosUploads,
  };
}

function projetoParaBanco(cliente: HomologacaoCard) {
  return {
    integrador_id: cliente.integradorId,
    status_id: cliente.status_id,
    nome: cliente.nome,
    email: cliente.email || null,
    telefone: cliente.telefone || null,
    cidade: cliente.cidade || null,
    estado: cliente.estado || null,
    cpf_cnpj: cliente.cpfCnpj,
    rg: cliente.rg,
    orgao_emissor: cliente.orgaoEmissor,
    endereco: cliente.endereco,
    bairro: cliente.bairro,
    cep: cliente.cep,
    concessionaria: cliente.concessionaria,
    cidade_concessionaria: cliente.cidadeConcessionaria,
    cnpj_concessionaria: cliente.cnpjConcessionaria,
    unidade_consumidora: cliente.unidadeConsumidora,
    titular: cliente.titular,
    representante: cliente.representante,
    cpf_representante: cliente.cpfRepresentante,
    contratado_nome: cliente.contratadoNome,
    contratado_cpf: cliente.contratadoCpf,
    contratado_rg: cliente.contratadoRg,
    contratado_orgao_emissor: cliente.contratadoOrgaoEmissor,
    contratado_endereco: cliente.contratadoEndereco,
    consumo_medio_kwh: cliente.consumoMedioKwh,
    potencia_kwp: cliente.potenciaKWp,
    demanda_calculada_kw: cliente.demandaCalculadaKw,
    tipo_ligacao: cliente.tipoLigacao,
    protocolo: cliente.protocolo,
    prazo: cliente.prazo,
    responsavel: cliente.responsavel,
    procuracao_gerada: cliente.procuracaoGerada,
    equipamentos: cliente.equipamentos,
    datasheets: cliente.datasheets,
    checklist: cliente.checklist,
    campos_adicionais: cliente.camposAdicionais,
    beneficiarias: cliente.beneficiarias,
    metodo_rateio: cliente.metodoRateio,
    updated_at: new Date().toISOString(),
  };
}

export function useHomologacaoKanban() {
  const supabase = useMemo(() => createClient(), []);
  const [colunas, setColunas] = useState<HomologacaoStatus[]>([]);
  const [clientes, setClientes] = useState<HomologacaoCard[]>([]);
  const [integradores, setIntegradores] = useState<HomologacaoIntegrador[]>([]);
  const [documentosPortal, setDocumentosPortal] = useState<HomologacaoDocumentoConfig[]>([]);
  const [datasheetsDisponiveis, setDatasheetsDisponiveis] = useState<HomologacaoDatasheet[]>([]);
  const [carregandoHomologacao, setCarregandoHomologacao] = useState(true);
  const [carregandoDatasheets, setCarregandoDatasheets] = useState(true);
  const [datasheetEmDownloadId, setDatasheetEmDownloadId] = useState<string | null>(null);
  const [documentoEmDownloadId, setDocumentoEmDownloadId] = useState<string | null>(null);
  const [enviandoDatasheet, setEnviandoDatasheet] = useState(false);
  const [gerandoProcuracaoId, setGerandoProcuracaoId] = useState<string | null>(null);

  async function carregarDatasheets() {
    setCarregandoDatasheets(true);
    const { data, error } = await supabase
      .from("inversores")
      .select("id, fabricante, modelo, potencia_kw, tags, datasheet_path, created_at, criado_em")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar datasheets:", error);
      setDatasheetsDisponiveis([]);
    } else {
      setDatasheetsDisponiveis(data || []);
    }

    setCarregandoDatasheets(false);
  }

  async function carregarHomologacao() {
    setCarregandoHomologacao(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setColunas([]);
        setClientes([]);
        setIntegradores([]);
        setDocumentosPortal([]);
        return;
      }

      const userId = session.user.id;
      const [statusResult, integradoresResult, documentosResult, projetosResult, uploadsResult] = await Promise.all([
        supabase.from("homologacao_status").select("*").order("ordem", { ascending: true }),
        supabase.from("homologacao_integradores").select("*").order("created_at", { ascending: true }),
        supabase.from("homologacao_documentos_config").select("*").order("created_at", { ascending: true }),
        supabase.from("homologacao_projetos").select("*").order("created_at", { ascending: false }),
        supabase.from("homologacao_documentos_uploads").select("*").order("created_at", { ascending: false }),
      ]);

      if (statusResult.error) throw statusResult.error;
      if (integradoresResult.error) throw integradoresResult.error;
      if (documentosResult.error) throw documentosResult.error;
      if (projetosResult.error) throw projetosResult.error;
      if (uploadsResult.error) throw uploadsResult.error;

      let statusData = statusResult.data || [];
      let integradoresData = integradoresResult.data || [];
      let documentosData = documentosResult.data || [];
      const uploadsPorProjeto = (uploadsResult.data || []).reduce<Record<string, HomologacaoDocumentoUpload[]>>((acc, upload) => {
        const uploadMapeado = uploadDoBanco(upload as HomologacaoDocumentoUploadRow);
        acc[uploadMapeado.projetoId] = [...(acc[uploadMapeado.projetoId] || []), uploadMapeado];
        return acc;
      }, {});

      if (statusData.length === 0) {
        const { data, error } = await supabase
          .from("homologacao_status")
          .insert(colunasPadraoHomologacao.map(coluna => ({ ...coluna, user_id: userId })))
          .select()
          .order("ordem", { ascending: true });
        if (error) throw error;
        statusData = data || [];
      }

      if (integradoresData.length === 0) {
        const { data, error } = await supabase
          .from("homologacao_integradores")
          .insert({ user_id: userId, nome: "Projetos Diretos", contato: "operacao@asaweb.com" })
          .select();
        if (error) throw error;
        integradoresData = data || [];
      }

      if (documentosData.length === 0) {
        const { data, error } = await supabase
          .from("homologacao_documentos_config")
          .insert(documentosPadraoHomologacao.map(documento => ({ ...documento, user_id: userId })))
          .select()
          .order("created_at", { ascending: true });
        if (error) throw error;
        documentosData = data || [];
      }

      const nomesDeStatus = new Set<string>();
      const statusUnicos = statusData.filter(coluna => {
        const nome = coluna.nome.trim().toLowerCase();
        if (nomesDeStatus.has(nome)) return false;
        nomesDeStatus.add(nome);
        return true;
      });

      setColunas(statusUnicos.map(coluna => ({
        id: coluna.id,
        nome: coluna.nome,
        cor: coluna.cor,
        ordem: coluna.ordem,
      })));
      setIntegradores(integradoresData.map(integrador => ({
        id: integrador.id,
        nome: integrador.nome,
        contato: integrador.contato || "",
        portalToken: integrador.portal_token,
        linkAcesso: montarLinkIntegrador(integrador.id, integrador.portal_token),
      })));
      setDocumentosPortal(documentosData.map(documento => ({
        id: documento.id,
        nome: documento.nome,
        tipo: documento.tipo,
        obrigatorio: documento.obrigatorio,
        ativo: documento.ativo,
      })));
      setClientes((projetosResult.data || []).map(projeto => projetoDoBanco(projeto, uploadsPorProjeto[projeto.id] || [])));
    } catch (error) {
      console.error("Erro ao carregar homologacao:", error);
    } finally {
      setCarregandoHomologacao(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregarHomologacao();
    void carregarDatasheets();
    // Dados iniciais do Supabase sao carregados uma vez ao abrir o modulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleColunaDrop(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) return;

    const novasColunas = [...colunas];
    const [colunaRemovida] = novasColunas.splice(sourceIndex, 1);
    novasColunas.splice(targetIndex, 0, colunaRemovida);
    const colunasOrdenadas = novasColunas.map((coluna, index) => ({ ...coluna, ordem: index + 1 }));

    setColunas(colunasOrdenadas);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { error } = await supabase.from("homologacao_status").upsert(
      colunasOrdenadas.map(coluna => ({
        id: coluna.id,
        user_id: session.user.id,
        nome: coluna.nome,
        cor: coluna.cor,
        ordem: coluna.ordem,
      }))
    );

    if (error) {
      console.error("Erro ao reordenar status:", error);
      void carregarHomologacao();
    }
  }

  async function handleCardDrop(clienteId: string, targetStatusId: string | null) {
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente => cliente.id === clienteId ? { ...cliente, status_id: targetStatusId } : cliente)
    );

    const { error } = await supabase
      .from("homologacao_projetos")
      .update({ status_id: targetStatusId, updated_at: new Date().toISOString() })
      .eq("id", clienteId);

    if (error) {
      console.error("Erro ao mover projeto:", error);
      void carregarHomologacao();
    }
  }

  async function adicionarColuna(nome: string) {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const novaColuna = {
      user_id: session.user.id,
      nome: nomeLimpo,
      cor: coresColunas[colunas.length % coresColunas.length],
      ordem: colunas.length + 1,
    };

    const { data, error } = await supabase.from("homologacao_status").insert(novaColuna).select().single();
    if (error) {
      console.error("Erro ao criar status:", error);
      return;
    }

    setColunas(colunasAtuais => [...colunasAtuais, data]);
  }

  async function excluirColunaCustomizada(id: string) {
    const colunasAnteriores = colunas;
    setColunas(colunasAtuais =>
      colunasAtuais.filter(coluna => coluna.id !== id).map((coluna, index) => ({ ...coluna, ordem: index + 1 }))
    );
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente => cliente.status_id === id ? { ...cliente, status_id: null } : cliente)
    );

    const { error } = await supabase.from("homologacao_status").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir status:", error);
      setColunas(colunasAnteriores);
      void carregarHomologacao();
    }
  }

  async function atualizarCliente(clienteAtualizado: HomologacaoCard) {
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente => cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente)
    );

    const { error } = await supabase
      .from("homologacao_projetos")
      .update(projetoParaBanco(clienteAtualizado))
      .eq("id", clienteAtualizado.id);

    if (error) {
      console.error("Erro ao atualizar projeto:", error);
      void carregarHomologacao();
    }
  }

  function criarIntegrador(nome: string, contato: string) {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return null;

    const id = crypto.randomUUID();
    const novoIntegrador = {
      id,
      nome: nomeLimpo,
      contato: contato.trim(),
      portalToken: crypto.randomUUID(),
      linkAcesso: "",
    };
    novoIntegrador.linkAcesso = montarLinkIntegrador(id, novoIntegrador.portalToken);

    setIntegradores(integradoresAtuais => [...integradoresAtuais, novoIntegrador]);

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const { error } = await supabase.from("homologacao_integradores").insert({
        id,
        user_id: session.user.id,
        nome: nomeLimpo,
        contato: contato.trim(),
        portal_token: novoIntegrador.portalToken,
      });
      if (error) {
        console.error("Erro ao criar integrador:", error);
        void carregarHomologacao();
      }
    });

    return novoIntegrador;
  }

  function criarProjetoManual(integradorId: string) {
    const id = crypto.randomUUID();
    const statusInicial = colunas[0]?.id || null;
    const novoCliente: HomologacaoCard = {
      id,
      integradorId,
      nome: "Novo projeto de homologacao",
      email: "",
      telefone: "",
      status_id: statusInicial,
      cidade: "",
      estado: "",
      cpfCnpj: "",
      rg: "",
      orgaoEmissor: "",
      endereco: "",
      bairro: "",
      cep: "",
      concessionaria: "",
      cidadeConcessionaria: "",
      cnpjConcessionaria: "",
      unidadeConsumidora: "",
      titular: "",
      representante: "",
      cpfRepresentante: "",
      contratadoNome: "Asaweb Energia Solar",
      contratadoCpf: "00.000.000/0001-00",
      contratadoRg: "",
      contratadoOrgaoEmissor: "",
      contratadoEndereco: "",
      consumoMedioKwh: 0,
      potenciaKWp: 0,
      demandaCalculadaKw: 0,
      tipoLigacao: "Bifasico",
      protocolo: null,
      prazo: "Novo projeto",
      responsavel: "",
      procuracaoGerada: false,
      equipamentos: [],
      datasheets: [],
      checklist: checklistPadraoHomologacao.map(item => ({ ...item })),
      camposAdicionais: [],
      beneficiarias: [],
      metodoRateio: "porcentagem",
      documentosUploads: [],
    };

    setClientes(clientesAtuais => [novoCliente, ...clientesAtuais]);

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const { error } = await supabase.from("homologacao_projetos").insert({
        id,
        user_id: session.user.id,
        ...projetoParaBanco(novoCliente),
      });
      if (error) {
        console.error("Erro ao criar projeto:", error);
        void carregarHomologacao();
      }
    });

    return id;
  }

  async function excluirProjeto(clienteId: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return false;

    const caminhos = cliente.documentosUploads.map(documento => documento.storagePath);
    if (caminhos.length > 0) {
      const { error: storageError } = await supabase.storage.from("homologacao-documentos").remove(caminhos);
      if (storageError) console.error("Erro ao remover anexos do projeto:", storageError);
    }

    const { error } = await supabase.from("homologacao_projetos").delete().eq("id", clienteId);
    if (error) {
      console.error("Erro ao excluir projeto:", error);
      return false;
    }

    setClientes(clientesAtuais => clientesAtuais.filter(clienteAtual => clienteAtual.id !== clienteId));
    return true;
  }

  async function criarDocumentoPortal(nome: string, tipo: HomologacaoDocumentoConfig["tipo"], obrigatorio: boolean) {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("homologacao_documentos_config")
      .insert({ user_id: session.user.id, nome: nomeLimpo, tipo, obrigatorio, ativo: true })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar documento:", error);
      return;
    }

    setDocumentosPortal(documentosAtuais => [...documentosAtuais, data]);
  }

  async function alternarDocumentoPortal(documentoId: string) {
    const documento = documentosPortal.find(item => item.id === documentoId);
    if (!documento) return;

    setDocumentosPortal(documentosAtuais =>
      documentosAtuais.map(item => item.id === documentoId ? { ...item, ativo: !item.ativo } : item)
    );

    const { error } = await supabase
      .from("homologacao_documentos_config")
      .update({ ativo: !documento.ativo })
      .eq("id", documentoId);

    if (error) {
      console.error("Erro ao atualizar documento:", error);
      void carregarHomologacao();
    }
  }

  async function alternarObrigatoriedadeDocumentoPortal(documentoId: string) {
    const documento = documentosPortal.find(item => item.id === documentoId);
    if (!documento) return;

    setDocumentosPortal(documentosAtuais =>
      documentosAtuais.map(item => item.id === documentoId ? { ...item, obrigatorio: !item.obrigatorio } : item)
    );

    const { error } = await supabase
      .from("homologacao_documentos_config")
      .update({ obrigatorio: !documento.obrigatorio })
      .eq("id", documentoId);

    if (error) {
      console.error("Erro ao atualizar obrigatoriedade do documento:", error);
      void carregarHomologacao();
    }
  }

  async function removerDocumentoPortal(documentoId: string) {
    setDocumentosPortal(documentosAtuais => documentosAtuais.filter(documento => documento.id !== documentoId));
    const { error } = await supabase.from("homologacao_documentos_config").delete().eq("id", documentoId);
    if (error) {
      console.error("Erro ao remover documento:", error);
      void carregarHomologacao();
    }
  }

  function patchCliente(clienteId: string, patch: Partial<HomologacaoCard>) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return;
    void atualizarCliente({ ...cliente, ...patch });
  }

  function atualizarCamposAdicionais(clienteId: string, camposAdicionais: HomologacaoCampoAdicional[]) {
    patchCliente(clienteId, { camposAdicionais });
  }

  function atualizarEquipamentos(clienteId: string, equipamentos: HomologacaoEquipamento[]) {
    patchCliente(clienteId, { equipamentos });
  }

  function atualizarBeneficiarias(clienteId: string, beneficiarias: HomologacaoBeneficiaria[]) {
    patchCliente(clienteId, { beneficiarias });
  }

  function adicionarChecklistItem(clienteId: string, label: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    const labelLimpo = label.trim();
    if (!cliente || !labelLimpo) return;
    void atualizarCliente({
      ...cliente,
      checklist: [...cliente.checklist, { id: crypto.randomUUID(), label: labelLimpo, done: false }],
    });
  }

  function atualizarChecklistItem(clienteId: string, checklistId: string, label: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return;
    void atualizarCliente({
      ...cliente,
      checklist: cliente.checklist.map(item => item.id === checklistId ? { ...item, label } : item),
    });
  }

  function removerChecklistItem(clienteId: string, checklistId: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return;
    void atualizarCliente({
      ...cliente,
      checklist: cliente.checklist.filter(item => item.id !== checklistId),
    });
  }

  function recalcularDemanda(clienteId: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return;

    const fatorLigacao = cliente.tipoLigacao === "Trifasico" ? 0.78 : 0.82;
    const demandaCalculadaKw = Number((cliente.potenciaKWp * fatorLigacao).toFixed(1));

    void atualizarCliente({
      ...cliente,
      demandaCalculadaKw,
      checklist: cliente.checklist.map(item => item.id === "demanda" ? { ...item, done: true } : item),
    });
  }

  async function gerarProcuracao(clienteId: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return;

    const documentoLimpo = cliente.cpfCnpj.replace(/\D/g, "");
    const arquivoModelo = documentoLimpo.length > 11 ? "modelo_pj.docx" : "modelo_pf.docx";
    const dataHoje = new Date();
    const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    const payload = {
      arquivo_modelo: arquivoModelo,
      nome: cliente.titular,
      NOME: cliente.titular,
      cpf: cliente.cpfCnpj,
      CPF: cliente.cpfCnpj,
      rg: cliente.rg,
      RG: cliente.rg,
      orgao_emissor: cliente.orgaoEmissor,
      ORGAO_EMISSOR: cliente.orgaoEmissor,
      endereco: cliente.endereco,
      ENDERECO: cliente.endereco,
      cidade: cliente.cidade || "",
      CIDADE: cliente.cidade || "",
      classificacao: cliente.tipoLigacao,
      CLASSIFICACAO: cliente.tipoLigacao,
      contacontrato: cliente.unidadeConsumidora,
      CONTACONTRATO: cliente.unidadeConsumidora,
      bairro: cliente.bairro,
      BAIRRO: cliente.bairro,
      cep: cliente.cep,
      CEP: cliente.cep,
      concessionaria: cliente.concessionaria,
      CONCESSIONARIA: cliente.concessionaria,
      cidade_concessionaria: cliente.cidadeConcessionaria,
      CIDADE_CONCESSIONARIA: cliente.cidadeConcessionaria,
      cnpj_concessionaria: cliente.cnpjConcessionaria,
      CNPJ_CONCESSIONARIA: cliente.cnpjConcessionaria,
      representante: cliente.representante,
      REPRESENTANTE: cliente.representante,
      cpf_representante: cliente.cpfRepresentante,
      CPF_DO_REPRESENTANTE: cliente.cpfRepresentante,
      nome_CONTRATADO: cliente.contratadoNome,
      NOME_CONTRATADO: cliente.contratadoNome,
      rg_CONTRATADO: cliente.contratadoRg,
      RG_CONTRATADO: cliente.contratadoRg,
      orgao_emissor_CONTRATADO: cliente.contratadoOrgaoEmissor,
      ORGAO_EMISSOR_CONTRATADO: cliente.contratadoOrgaoEmissor,
      cpf_CONTRATADO: cliente.contratadoCpf,
      CPF_CONTRATADO: cliente.contratadoCpf,
      endereco_CONTRATADO: cliente.contratadoEndereco,
      ENDERECO_CONTRATADO: cliente.contratadoEndereco,
      DIA: dataHoje.getDate().toString(),
      MES: meses[dataHoje.getMonth()],
      ANO: dataHoje.getFullYear().toString(),
    };

    try {
      setGerandoProcuracaoId(clienteId);
      const response = await fetch("/api/procuracao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao gerar documento.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Procuracao_${cliente.titular.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      await atualizarCliente({
        ...cliente,
        procuracaoGerada: true,
        checklist: cliente.checklist.map(item => item.id === "procuracao" ? { ...item, done: true } : item),
      });
    } catch (error) {
      console.error("Erro ao gerar procuracao:", error);
      alert("Nao foi possivel gerar a procuracao. Verifique a API de documentos.");
    } finally {
      setGerandoProcuracaoId(null);
    }
  }

  function alternarChecklist(clienteId: string, checklistId: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return;
    void atualizarCliente({
      ...cliente,
      checklist: cliente.checklist.map(item => item.id === checklistId ? { ...item, done: !item.done } : item),
    });
  }

  function alternarDatasheet(clienteId: string, datasheetId: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return;

    const jaSelecionado = cliente.datasheets.includes(datasheetId);
    const datasheets = jaSelecionado
      ? cliente.datasheets.filter(id => id !== datasheetId)
      : [...cliente.datasheets, datasheetId];

    void atualizarCliente({
      ...cliente,
      datasheets,
      checklist: cliente.checklist.map(item => item.id === "datasheets" ? { ...item, done: datasheets.length > 0 } : item),
    });
  }

  async function baixarDatasheet(datasheet: HomologacaoDatasheet) {
    if (!datasheet.datasheet_path) {
      alert("Este datasheet nao possui arquivo PDF associado.");
      return;
    }

    try {
      setDatasheetEmDownloadId(datasheet.id);
      const { data, error } = await supabase.storage
        .from("datasheets")
        .createSignedUrl(datasheet.datasheet_path, 60, { download: true });

      if (error) throw error;

      if (data?.signedUrl) {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = `${datasheet.fabricante}_${datasheet.modelo}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Erro ao baixar datasheet:", error);
      alert("Nao foi possivel baixar o datasheet.");
    } finally {
      setDatasheetEmDownloadId(null);
    }
  }

  async function baixarDocumentoProjeto(documento: HomologacaoDocumentoUpload) {
    try {
      setDocumentoEmDownloadId(documento.id);
      const { data, error } = await supabase.storage
        .from("homologacao-documentos")
        .createSignedUrl(documento.storagePath, 60, { download: true });

      if (error) throw error;

      if (data?.signedUrl) {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = documento.nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Erro ao baixar documento do projeto:", error);
      alert("Nao foi possivel baixar o documento.");
    } finally {
      setDocumentoEmDownloadId(null);
    }
  }

  async function cadastrarDatasheet(input: NovoDatasheetInput) {
    setEnviandoDatasheet(true);

    try {
      const fileExt = input.arquivo.name.split(".").pop() || "pdf";
      const nomeBaseLimpo = input.modelo.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const filePath = `${Date.now()}_homologacao_${nomeBaseLimpo}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("datasheets")
        .upload(filePath, input.arquivo);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("inversores")
        .insert({
          fabricante: input.fabricante,
          modelo: input.modelo,
          potencia_kw: input.potencia_kw,
          tags: input.tags,
          datasheet_path: filePath,
        });

      if (insertError) throw insertError;

      await carregarDatasheets();
    } catch (error) {
      console.error("Erro ao cadastrar datasheet:", error);
      alert("Nao foi possivel anexar o datasheet na biblioteca.");
      throw error;
    } finally {
      setEnviandoDatasheet(false);
    }
  }

  return {
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
    excluirProjeto,
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
  };
}
