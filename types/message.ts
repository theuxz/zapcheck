// c:\Users\sonbl\zapcheck\types\message.ts

export type MessageCategory =
  | "novo_cliente"
  | "pedido"
  | "cobranca"
  | "suporte"
  | "outros";

export type MessageUrgency = "alta" | "media" | "baixa";

export interface Message {
  id: string;
  texto_original: string;
  nome: string | null;
  telefone: string | null;
  categoria: MessageCategory;
  intencao: string;
  valor_mencionado: number | null;
  urgencia: MessageUrgency;
  precisa_followup: boolean;
  resumo: string;
  atendida: boolean;
  created_at: string;
}

export interface AnalyzeRequest {
  texto: string;
}

export interface AnalyzeResponse extends Message {}

export const MESSAGE_CATEGORIES: MessageCategory[] = [
  "novo_cliente",
  "pedido",
  "cobranca",
  "suporte",
  "outros",
];

export const MESSAGE_URGENCIES: MessageUrgency[] = ["alta", "media", "baixa"];

export const CATEGORY_LABELS: Record<MessageCategory, string> = {
  novo_cliente: "Novo cliente",
  pedido: "Pedido",
  cobranca: "Cobrança",
  suporte: "Suporte",
  outros: "Outros",
};

export const URGENCY_LABELS: Record<MessageUrgency, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};
