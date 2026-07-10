export interface HomologacaoStatus {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
}

export interface HomologacaoCard {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  status_id: string | null;
  cidade: string | null;
  estado: string | null;
  cpfCnpj: string;
  rg: string;
  orgaoEmissor: string;
  endereco: string;
  bairro: string;
  cep: string;
  concessionaria: string;
  cidadeConcessionaria: string;
  cnpjConcessionaria: string;
  unidadeConsumidora: string;
  titular: string;
  representante: string;
  cpfRepresentante: string;
  contratadoNome: string;
  contratadoCpf: string;
  contratadoRg: string;
  contratadoOrgaoEmissor: string;
  contratadoEndereco: string;
  consumoMedioKwh: number;
  potenciaKWp: number;
  demandaCalculadaKw: number;
  tipoLigacao: "Monofasico" | "Bifasico" | "Trifasico";
  protocolo: string | null;
  prazo: string;
  responsavel: string;
  procuracaoGerada: boolean;
  equipamentos: HomologacaoEquipamento[];
  datasheets: string[];
  checklist: HomologacaoChecklistItem[];
}

export interface HomologacaoEquipamento {
  tipo: "Modulo" | "Inversor";
  modelo: string;
  quantidade: number;
}

export interface HomologacaoChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface HomologacaoDatasheet {
  id: string;
  fabricante: string;
  modelo: string;
  potencia_kw: number;
  tags: string[] | null;
  datasheet_path: string;
  created_at?: string;
  criado_em?: string;
}

export const homologacaoColunasMock: HomologacaoStatus[] = [
  {
    id: "recebido",
    nome: "Recebido",
    cor: "#2563eb",
    ordem: 1,
  },
  {
    id: "analise",
    nome: "Em analise",
    cor: "#7c3aed",
    ordem: 2,
  },
  {
    id: "aguardando",
    nome: "Aguardando Concessionaria",
    cor: "#f59e0b",
    ordem: 3,
  },
  {
    id: "aprovado",
    nome: "Aprovado",
    cor: "#16a34a",
    ordem: 4,
  },
];

export const homologacaoCardsMock: HomologacaoCard[] = [
  {
    id: "hom-1",
    nome: "Projeto Joao Silva",
    email: "joao.silva@email.com",
    telefone: "(11) 99999-1100",
    status_id: "recebido",
    cidade: "Campinas",
    estado: "SP",
    cpfCnpj: "123.456.789-00",
    rg: "12.345.678-9",
    orgaoEmissor: "SSP/SP",
    endereco: "Rua das Acacias, 120",
    bairro: "Cambuí",
    cep: "13024-110",
    concessionaria: "CPFL Paulista",
    cidadeConcessionaria: "Campinas",
    cnpjConcessionaria: "33.050.196/0001-88",
    unidadeConsumidora: "UC 10445520",
    titular: "Joao Silva",
    representante: "",
    cpfRepresentante: "",
    contratadoNome: "Asaweb Energia Solar",
    contratadoCpf: "00.000.000/0001-00",
    contratadoRg: "",
    contratadoOrgaoEmissor: "",
    contratadoEndereco: "Rua Comercial, 100 - Centro",
    consumoMedioKwh: 720,
    potenciaKWp: 6.6,
    demandaCalculadaKw: 5.4,
    tipoLigacao: "Bifasico",
    protocolo: null,
    prazo: "Enviar ate 18/07",
    responsavel: "Marina",
    procuracaoGerada: false,
    equipamentos: [
      { tipo: "Modulo", modelo: "ASW 550M", quantidade: 12 },
      { tipo: "Inversor", modelo: "SUN2000-5KTL-L1", quantidade: 1 },
    ],
    datasheets: [],
    checklist: [
      { id: "conta", label: "Conta de luz anexada", done: true },
      { id: "demanda", label: "Calculo de demanda validado", done: false },
      { id: "procuracao", label: "Procuracao gerada", done: false },
      { id: "datasheets", label: "Datasheets selecionados", done: false },
    ],
  },
  {
    id: "hom-2",
    nome: "Mercado Central - 42kWp",
    email: "engenharia@mercadocentral.com",
    telefone: "(19) 3333-4200",
    status_id: "recebido",
    cidade: "Limeira",
    estado: "SP",
    cpfCnpj: "12.345.678/0001-90",
    rg: "",
    orgaoEmissor: "",
    endereco: "Av. Principal, 55",
    bairro: "Centro",
    cep: "13480-000",
    concessionaria: "Elektro",
    cidadeConcessionaria: "Campinas",
    cnpjConcessionaria: "02.328.280/0001-97",
    unidadeConsumidora: "UC 99241031",
    titular: "Mercado Central LTDA",
    representante: "Carlos Andrade",
    cpfRepresentante: "987.654.321-00",
    contratadoNome: "Asaweb Energia Solar",
    contratadoCpf: "00.000.000/0001-00",
    contratadoRg: "",
    contratadoOrgaoEmissor: "",
    contratadoEndereco: "Rua Comercial, 100 - Centro",
    consumoMedioKwh: 4480,
    potenciaKWp: 42,
    demandaCalculadaKw: 33.6,
    tipoLigacao: "Trifasico",
    protocolo: null,
    prazo: "Coletar documentos",
    responsavel: "Rafael",
    procuracaoGerada: false,
    equipamentos: [
      { tipo: "Modulo", modelo: "ASW 550M", quantidade: 76 },
      { tipo: "Inversor", modelo: "MIN 8000TL-X", quantidade: 5 },
    ],
    datasheets: [],
    checklist: [
      { id: "conta", label: "Conta de luz anexada", done: true },
      { id: "demanda", label: "Calculo de demanda validado", done: true },
      { id: "procuracao", label: "Procuracao gerada", done: false },
      { id: "datasheets", label: "Datasheets selecionados", done: false },
    ],
  },
  {
    id: "hom-3",
    nome: "Projeto Maria Souza",
    email: "maria.souza@email.com",
    telefone: "(31) 98888-2211",
    status_id: "analise",
    cidade: "Belo Horizonte",
    estado: "MG",
    cpfCnpj: "234.567.890-11",
    rg: "MG-11.222.333",
    orgaoEmissor: "SSP/MG",
    endereco: "Rua Minas Gerais, 300",
    bairro: "Savassi",
    cep: "30140-090",
    concessionaria: "Cemig",
    cidadeConcessionaria: "Belo Horizonte",
    cnpjConcessionaria: "06.981.180/0001-16",
    unidadeConsumidora: "UC 5510287",
    titular: "Maria Souza",
    representante: "",
    cpfRepresentante: "",
    contratadoNome: "Asaweb Energia Solar",
    contratadoCpf: "00.000.000/0001-00",
    contratadoRg: "",
    contratadoOrgaoEmissor: "",
    contratadoEndereco: "Rua Comercial, 100 - Centro",
    consumoMedioKwh: 980,
    potenciaKWp: 8.25,
    demandaCalculadaKw: 6.8,
    tipoLigacao: "Trifasico",
    protocolo: "CEMIG-2026-11984",
    prazo: "Retorno tecnico em 5 dias",
    responsavel: "Bianca",
    procuracaoGerada: true,
    equipamentos: [
      { tipo: "Modulo", modelo: "ASW 550M", quantidade: 15 },
      { tipo: "Inversor", modelo: "MIN 8000TL-X", quantidade: 1 },
    ],
    datasheets: [],
    checklist: [
      { id: "conta", label: "Conta de luz anexada", done: true },
      { id: "demanda", label: "Calculo de demanda validado", done: true },
      { id: "procuracao", label: "Procuracao gerada", done: true },
      { id: "datasheets", label: "Datasheets selecionados", done: false },
    ],
  },
  {
    id: "hom-4",
    nome: "Usina Solar LTDA - 75kWp",
    email: "operacoes@solarltda.com",
    telefone: "(47) 3444-7500",
    status_id: "aguardando",
    cidade: "Joinville",
    estado: "SC",
    cpfCnpj: "22.333.444/0001-55",
    rg: "",
    orgaoEmissor: "",
    endereco: "Rodovia Industrial, 800",
    bairro: "Distrito Industrial",
    cep: "89219-600",
    concessionaria: "Celesc",
    cidadeConcessionaria: "Florianopolis",
    cnpjConcessionaria: "08.336.783/0001-90",
    unidadeConsumidora: "UC 77001942",
    titular: "Solar LTDA",
    representante: "Helena Costa",
    cpfRepresentante: "321.654.987-00",
    contratadoNome: "Asaweb Energia Solar",
    contratadoCpf: "00.000.000/0001-00",
    contratadoRg: "",
    contratadoOrgaoEmissor: "",
    contratadoEndereco: "Rua Comercial, 100 - Centro",
    consumoMedioKwh: 8200,
    potenciaKWp: 75,
    demandaCalculadaKw: 58.2,
    tipoLigacao: "Trifasico",
    protocolo: "CELESC-3107/2026",
    prazo: "Aguardando parecer",
    responsavel: "Marina",
    procuracaoGerada: true,
    equipamentos: [
      { tipo: "Modulo", modelo: "ASW 550M", quantidade: 136 },
      { tipo: "Inversor", modelo: "MIN 8000TL-X", quantidade: 9 },
    ],
    datasheets: [],
    checklist: [
      { id: "conta", label: "Conta de luz anexada", done: true },
      { id: "demanda", label: "Calculo de demanda validado", done: true },
      { id: "procuracao", label: "Procuracao gerada", done: true },
      { id: "datasheets", label: "Datasheets selecionados", done: false },
    ],
  },
  {
    id: "hom-5",
    nome: "Condominio Vista Norte",
    email: "sindico@vistanorte.com",
    telefone: "(21) 3777-9000",
    status_id: null,
    cidade: "Niteroi",
    estado: "RJ",
    cpfCnpj: "33.444.555/0001-66",
    rg: "",
    orgaoEmissor: "",
    endereco: "Rua Vista Norte, 45",
    bairro: "Icaraí",
    cep: "24230-000",
    concessionaria: "Enel RJ",
    cidadeConcessionaria: "Niteroi",
    cnpjConcessionaria: "33.050.071/0001-58",
    unidadeConsumidora: "UC 88912045",
    titular: "Condominio Vista Norte",
    representante: "Paulo Mendes",
    cpfRepresentante: "456.789.123-00",
    contratadoNome: "Asaweb Energia Solar",
    contratadoCpf: "00.000.000/0001-00",
    contratadoRg: "",
    contratadoOrgaoEmissor: "",
    contratadoEndereco: "Rua Comercial, 100 - Centro",
    consumoMedioKwh: 3600,
    potenciaKWp: 32,
    demandaCalculadaKw: 25.5,
    tipoLigacao: "Trifasico",
    protocolo: null,
    prazo: "Definir status",
    responsavel: "Rafael",
    procuracaoGerada: false,
    equipamentos: [
      { tipo: "Modulo", modelo: "ASW 550M", quantidade: 58 },
      { tipo: "Inversor", modelo: "MIN 8000TL-X", quantidade: 4 },
    ],
    datasheets: [],
    checklist: [
      { id: "conta", label: "Conta de luz anexada", done: false },
      { id: "demanda", label: "Calculo de demanda validado", done: false },
      { id: "procuracao", label: "Procuracao gerada", done: false },
      { id: "datasheets", label: "Datasheets selecionados", done: false },
    ],
  },
];
