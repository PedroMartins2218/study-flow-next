// Helpers de data compartilhados pelas telas do painel.

export function hojeISO(): string {
  return new Date().toISOString().split("T")[0];
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
