import type { Assinatura, StatusAssinatura } from "@/types/dominio";

// Regras de acesso puras — sem nenhum import do Firebase.
// Isto existe separado de `assinatura.ts` (que importa firebase/firestore, e
// portanto só roda no cliente) para que o servidor possa aplicar exatamente as
// mesmas regras nas rotas de API. Trava de assinatura só no cliente não protege
// endpoint que gasta dinheiro — o Agente de IA depende disto.

// Data de hoje em Brasília, no formato YYYY-MM-DD (mesmo formato de `expiracao`).
// Usar UTC aqui viraria o dia 3h mais cedo e cortaria o acesso de quem pagou
// no fim da noite.
export function hojeISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Status que ainda dão acesso ao produto:
//  - ativo/trial: o caso normal;
//  - inadimplente: pagamento falhou, mas damos carência até o fim do ciclo pago;
//  - cancelado: cancelou/reembolsou, mas já pagou por este ciclo.
// `expirado` e `inativo` nunca dão acesso.
const STATUS_COM_ACESSO: readonly StatusAssinatura[] = [
  "ativo",
  "trial",
  "inadimplente",
  "cancelado",
];

export function assinaturaEstaAtiva(assinatura: Assinatura | null): boolean {
  if (!assinatura) return false;
  if (!STATUS_COM_ACESSO.includes(assinatura.status)) return false;

  if (!assinatura.expiracao) {
    // Sem data de expiração só vale para acesso concedido "em aberto"
    // (liberação manual pelo script). Inadimplente/cancelado sem data não
    // significam nada além de "acabou".
    return assinatura.status === "ativo" || assinatura.status === "trial";
  }

  return assinatura.expiracao >= hojeISO();
}

// Porta do Agente de IA. Exige assinatura vigente E tier Pro — o trial de
// fundador (que não tem tier) fica no Base de propósito, para não abrir custo
// de API para quem não pagou.
export function temAcessoIa(assinatura: Assinatura | null): boolean {
  return assinaturaEstaAtiva(assinatura) && assinatura?.tier === "pro";
}

// Data de ontem em Brasília. Usada para revogar acesso na hora (chargeback e
// reembolso): gravar "hoje" ainda deixaria o resto do dia liberado.
export function ontemISO(): string {
  return somarDias(hojeISO(), -1);
}

// Soma N dias a uma data YYYY-MM-DD. Usa UTC só para a aritmética, o que é
// seguro porque a entrada já é data de calendário, sem hora.
export function somarDias(dataISO: string, dias: number): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().split("T")[0];
}

// Soma um mês a uma data YYYY-MM-DD, segurando o fim do mês: 31/01 + 1 mês
// vira 28/02 (ou 29/02), nunca "03/03" como o Date faria sozinho.
export function somarUmMes(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const alvoAno = mes === 12 ? ano + 1 : ano;
  const alvoMes = mes === 12 ? 1 : mes + 1;
  const ultimoDiaDoAlvo = new Date(Date.UTC(alvoAno, alvoMes, 0)).getUTCDate();
  const alvoDia = Math.min(dia, ultimoDiaDoAlvo);
  return `${alvoAno}-${String(alvoMes).padStart(2, "0")}-${String(alvoDia).padStart(2, "0")}`;
}

// Nova validade a partir de uma renovação: se a assinatura ainda está vigente,
// soma em cima da expiração atual (não perde os dias que sobraram); se já
// venceu, conta a partir de hoje.
export function proximaExpiracao(expiracaoAtual: string | undefined): string {
  const hoje = hojeISO();
  const base = expiracaoAtual && expiracaoAtual > hoje ? expiracaoAtual : hoje;
  return somarUmMes(base);
}
