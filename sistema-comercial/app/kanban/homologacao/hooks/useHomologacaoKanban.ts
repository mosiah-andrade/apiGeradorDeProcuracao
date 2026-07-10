"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  homologacaoCardsMock,
  homologacaoColunasMock,
  type HomologacaoCard,
  type HomologacaoDatasheet,
  type HomologacaoStatus,
} from "../mockData";

const coresColunas = ["#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#0891b2", "#65a30d"];

interface NovoDatasheetInput {
  fabricante: string;
  modelo: string;
  potencia_kw: number;
  tags: string[];
  arquivo: File;
}

export function useHomologacaoKanban() {
  const supabase = createClient();
  const [colunas, setColunas] = useState<HomologacaoStatus[]>(homologacaoColunasMock);
  const [clientes, setClientes] = useState<HomologacaoCard[]>(homologacaoCardsMock);
  const [datasheetsDisponiveis, setDatasheetsDisponiveis] = useState<HomologacaoDatasheet[]>([]);
  const [carregandoDatasheets, setCarregandoDatasheets] = useState(true);
  const [datasheetEmDownloadId, setDatasheetEmDownloadId] = useState<string | null>(null);
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

  useEffect(() => {
    let ativo = true;

    async function carregarDatasheetsInicial() {
      const { data, error } = await supabase
        .from("inversores")
        .select("id, fabricante, modelo, potencia_kw, tags, datasheet_path, created_at, criado_em")
        .order("created_at", { ascending: false });

      if (!ativo) return;

      if (error) {
        console.error("Erro ao carregar datasheets:", error);
        setDatasheetsDisponiveis([]);
      } else {
        setDatasheetsDisponiveis(data || []);
      }

      setCarregandoDatasheets(false);
    }

    void carregarDatasheetsInicial();

    return () => {
      ativo = false;
    };
  }, [supabase]);

  function handleColunaDrop(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) return;

    const novasColunas = [...colunas];
    const [colunaRemovida] = novasColunas.splice(sourceIndex, 1);
    novasColunas.splice(targetIndex, 0, colunaRemovida);

    setColunas(novasColunas.map((coluna, index) => ({
      ...coluna,
      ordem: index + 1,
    })));
  }

  function handleCardDrop(clienteId: string, targetStatusId: string | null) {
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente =>
        cliente.id === clienteId ? { ...cliente, status_id: targetStatusId } : cliente
      )
    );
  }

  function adicionarColuna(nome: string) {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    setColunas(colunasAtuais => [
      ...colunasAtuais,
      {
        id: `hom-status-${Date.now()}`,
        nome: nomeLimpo,
        cor: coresColunas[colunasAtuais.length % coresColunas.length],
        ordem: colunasAtuais.length + 1,
      },
    ]);
  }

  function excluirColunaCustomizada(id: string) {
    setColunas(colunasAtuais =>
      colunasAtuais
        .filter(coluna => coluna.id !== id)
        .map((coluna, index) => ({ ...coluna, ordem: index + 1 }))
    );
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente =>
        cliente.status_id === id ? { ...cliente, status_id: null } : cliente
      )
    );
  }

  function atualizarCliente(clienteAtualizado: HomologacaoCard) {
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente =>
        cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente
      )
    );
  }

  function recalcularDemanda(clienteId: string) {
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente => {
        if (cliente.id !== clienteId) return cliente;

        const fatorLigacao = cliente.tipoLigacao === "Trifasico" ? 0.78 : 0.82;
        const demandaCalculadaKw = Number((cliente.potenciaKWp * fatorLigacao).toFixed(1));

        return {
          ...cliente,
          demandaCalculadaKw,
          checklist: cliente.checklist.map(item =>
            item.id === "demanda" ? { ...item, done: true } : item
          ),
        };
      })
    );
  }

  async function gerarProcuracao(clienteId: string) {
    const cliente = clientes.find(item => item.id === clienteId);
    if (!cliente) return;

    const documentoLimpo = cliente.cpfCnpj.replace(/\D/g, "");
    const arquivoModelo = documentoLimpo.length > 11 ? "modelo_pj.docx" : "modelo_pf.docx";
    const dataHoje = new Date();
    const meses = [
      "janeiro",
      "fevereiro",
      "marco",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];

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
        headers: {
          "Content-Type": "application/json",
        },
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

      setClientes(clientesAtuais =>
        clientesAtuais.map(item =>
          item.id === clienteId
            ? {
                ...item,
                procuracaoGerada: true,
                checklist: item.checklist.map(checklistItem =>
                  checklistItem.id === "procuracao" ? { ...checklistItem, done: true } : checklistItem
                ),
              }
            : item
        )
      );
    } catch (error) {
      console.error("Erro ao gerar procuracao:", error);
      alert("Nao foi possivel gerar a procuracao. Verifique a API de documentos.");
    } finally {
      setGerandoProcuracaoId(null);
    }
  }

  function alternarChecklist(clienteId: string, checklistId: string) {
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente =>
        cliente.id === clienteId
          ? {
              ...cliente,
              checklist: cliente.checklist.map(item =>
                item.id === checklistId ? { ...item, done: !item.done } : item
              ),
            }
          : cliente
      )
    );
  }

  function alternarDatasheet(clienteId: string, datasheetId: string) {
    setClientes(clientesAtuais =>
      clientesAtuais.map(cliente => {
        if (cliente.id !== clienteId) return cliente;

        const jaSelecionado = cliente.datasheets.includes(datasheetId);
        const datasheets = jaSelecionado
          ? cliente.datasheets.filter(id => id !== datasheetId)
          : [...cliente.datasheets, datasheetId];

        return {
          ...cliente,
          datasheets,
          checklist: cliente.checklist.map(item =>
            item.id === "datasheets" ? { ...item, done: datasheets.length > 0 } : item
          ),
        };
      })
    );
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
        .createSignedUrl(datasheet.datasheet_path, 60, {
          download: true,
        });

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
  };
}
