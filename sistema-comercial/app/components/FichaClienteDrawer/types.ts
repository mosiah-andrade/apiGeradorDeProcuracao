export interface ClienteData {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  concessionaria: string;
  codigo_uc: string;
  cidade: string;
  estado: string;
  status_id: string | null;
  kanban_status?: { nome: string };
}

export interface KanbanStatus {
  id: string;
  nome: string;
  ordem: number;
  cor: string;
}

export interface Proposta {
  id: string;
  cliente_name: string;
  cliente_email?: string;
  valor_total: number;
  potencia_kwp: number;
  created_at: string;
  itens_config?: any[];
  consumo_mensal?: number;
  geracao_estimada?: number;
  payback_anos?: number;
}
