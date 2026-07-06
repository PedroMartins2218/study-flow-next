// Data prevista de lançamento do Study Flow (horário de Brasília).
// Fonte única usada pela contagem regressiva, pela trava de reservas e pelo
// trial — mudou a data? Muda só aqui.
export const DATA_LANCAMENTO_ISO = "2026-07-08T10:00:00-03:00";
export const DATA_LANCAMENTO_MS = new Date(DATA_LANCAMENTO_ISO).getTime();

// Dias de teste grátis liberados para quem reservou.
export const DIAS_TRIAL = 7;

// Já passou do lançamento? (funciona no cliente e no servidor)
export function jaLancou(): boolean {
  return Date.now() >= DATA_LANCAMENTO_MS;
}
