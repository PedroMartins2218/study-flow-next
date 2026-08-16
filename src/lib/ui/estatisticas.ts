import { dataLocalISO, hojeISO } from "@/lib/ui/datas";
import type { SessaoFoco } from "@/types/studyflow";

// Agregações das sessões de foco, num só lugar — o dashboard e a tela de
// gráficos mostravam os mesmos números calculados de formas diferentes.

/** Minutos de foco somados por dia (chave YYYY-MM-DD). */
export function minutosPorDia(sessoes: SessaoFoco[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const s of sessoes) mapa.set(s.data, (mapa.get(s.data) ?? 0) + s.mins);
  return mapa;
}

/**
 * Dias seguidos com pelo menos uma sessão de foco.
 * Conta a partir de hoje ou, se hoje ainda não teve sessão, de ontem — assim
 * a sequência não "quebra" só porque o dia ainda está começando.
 */
export function calcularStreak(sessoes: SessaoFoco[]): number {
  const dias = new Set(sessoes.map((s) => s.data));
  const cursor = new Date();
  if (!dias.has(dataLocalISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dias.has(dataLocalISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Lista dos últimos N dias (YYYY-MM-DD), do mais antigo ao mais recente. */
export function ultimosDias(quantidade: number): string[] {
  const dias: string[] = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push(dataLocalISO(d));
  }
  return dias;
}

export interface ResumoFoco {
  totalMinutos: number;
  minutosSemana: number;
  minutosSemanaAnterior: number;
  /** Variação % da semana atual sobre a anterior; null quando não há base. */
  variacaoSemanal: number | null;
  mediaDiaria7: number;
  melhorDia: { data: string; mins: number } | null;
  diasEstudadosNoMes: number;
}

export function resumoFoco(sessoes: SessaoFoco[]): ResumoFoco {
  const porDia = minutosPorDia(sessoes);
  const totalMinutos = sessoes.reduce((soma, s) => soma + s.mins, 0);

  const ultimos7 = ultimosDias(7);
  const ultimos14 = ultimosDias(14);
  const semanaAnteriorDias = ultimos14.slice(0, 7);

  const somar = (dias: string[]) =>
    dias.reduce((soma, d) => soma + (porDia.get(d) ?? 0), 0);

  const minutosSemana = somar(ultimos7);
  const minutosSemanaAnterior = somar(semanaAnteriorDias);

  const variacaoSemanal =
    minutosSemanaAnterior > 0
      ? Math.round(((minutosSemana - minutosSemanaAnterior) / minutosSemanaAnterior) * 100)
      : null;

  let melhorDia: { data: string; mins: number } | null = null;
  for (const [data, mins] of porDia) {
    if (!melhorDia || mins > melhorDia.mins) melhorDia = { data, mins };
  }

  const mesAtual = hojeISO().slice(0, 7);
  let diasEstudadosNoMes = 0;
  for (const [data, mins] of porDia) {
    if (mins > 0 && data.startsWith(mesAtual)) diasEstudadosNoMes++;
  }

  return {
    totalMinutos,
    minutosSemana,
    minutosSemanaAnterior,
    variacaoSemanal,
    mediaDiaria7: Math.round(minutosSemana / 7),
    melhorDia,
    diasEstudadosNoMes,
  };
}

/** "95" -> "1h 35min"; "0" -> "0min" */
export function formatarMinutos(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}
