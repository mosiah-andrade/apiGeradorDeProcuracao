// app/types.ts
export interface FormData {
  nome: string; cpf: string; rg: string; orgao_emissor: string;
  endereco: string; cidade: string; classificacao: string;
  contacontrato: string; bairro: string; cep: string;
  concessionaria: string; 
  cidade_concessionaria: string;
  cnpj_concessionaria: string;
  representante: string; cpf_representante: string;
  nome_CONTRATADO: string; rg_CONTRATADO: string; orgao_emissor_CONTRATADO: string;
  cpf_CONTRATADO: string; endereco_CONTRATADO: string;
  [key: string]: string;
}