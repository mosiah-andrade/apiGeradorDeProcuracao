export interface KanbanCard {
  id: string;
  titulo: string;
  cliente: string;
  descricao?: string;
  prioridade?: "baixa" | "media" | "alta";
}

export interface KanbanColumn {
  id: string;
  titulo: string;
  cards: KanbanCard[];
}