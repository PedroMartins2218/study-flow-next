// Helpers de data compartilhados pelas telas do painel.

// Reexporta a implementação única (a mesma usada pela assinatura), para não
// existirem duas noções de "hoje" no sistema.
export { hojeISO } from "@/lib/data/assinaturaCore";

import { hojeISO } from "@/lib/data/assinaturaCore";

/**
 * Data local (Brasília) de um Date, no formato YYYY-MM-DD.
 *
 * NÃO usar `toISOString().split("T")[0]`: aquilo devolve a data em UTC, que às
 * 21h no horário de Brasília já é o dia seguinte. Isso fazia a sessão de foco
 * da noite ser gravada como "amanhã", zerando o foco do dia e quebrando a
 * sequência de dias seguidos.
 */
export function dataLocalISO(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Data de N dias atrás (contando pelo calendário de Brasília).
export function diasAtrasISO(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return dataLocalISO(d);
}

// "2026-07-02" -> "02/07"
export function formatarDataCurta(iso?: string): string {
  if (!iso) return "";
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

// Dias entre hoje e a data (positivo = futuro).
export function diasAte(iso: string): number {
  const alvo = new Date(iso + "T00:00:00").getTime();
  const hoje = new Date(hojeISO() + "T00:00:00").getTime();
  return Math.round((alvo - hoje) / 86400000);
}
