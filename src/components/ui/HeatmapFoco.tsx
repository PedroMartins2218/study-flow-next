"use client";

import { useMemo } from "react";
import { dataLocalISO } from "@/lib/ui/datas";
import { formatarMinutos, minutosPorDia } from "@/lib/ui/estatisticas";
import type { SessaoFoco } from "@/types/dominio";

// Calendário de constância no estilo "contribuições": uma coluna por semana,
// uma linha por dia da semana. Mostra de relance se a rotina está de pé —
// que é o que o Nexo Study promete (constância, não aprovação).

const SEMANAS = 18;
const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES_CURTOS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

// 5 faixas de intensidade. O tom mais forte fica reservado para sessões
// longas, senão qualquer dia vira "verde escuro" e o gráfico perde a graça.
function intensidade(mins: number): number {
  if (mins <= 0) return 0;
  if (mins < 25) return 1;
  if (mins < 50) return 2;
  if (mins < 90) return 3;
  return 4;
}

const OPACIDADE = [0, 0.25, 0.45, 0.7, 1];

export function HeatmapFoco({ sessoes }: { sessoes: SessaoFoco[] }) {
  const { semanas, rotulosMes, totalDias } = useMemo(() => {
    const porDia = minutosPorDia(sessoes);

    // A última coluna tem de ser a semana corrente (senão o dia de hoje fica
    // de fora da grade). Então: domingo desta semana, menos SEMANAS-1 semanas.
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - inicio.getDay()); // domingo desta semana
    inicio.setDate(inicio.getDate() - (SEMANAS - 1) * 7);

    const hojeIso = dataLocalISO(new Date());
    const semanas: { iso: string; mins: number; futuro: boolean }[][] = [];
    const rotulosMes: { coluna: number; texto: string }[] = [];
    let ultimoMes = -1;
    let totalDias = 0;

    const cursor = new Date(inicio);
    for (let s = 0; s < SEMANAS; s++) {
      const semana: { iso: string; mins: number; futuro: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = dataLocalISO(cursor);
        const mins = porDia.get(iso) ?? 0;
        if (mins > 0) totalDias++;
        semana.push({ iso, mins, futuro: iso > hojeIso });

        // Rótulo do mês na primeira coluna em que o mês muda.
        if (d === 0) {
          const mes = Number(iso.slice(5, 7)) - 1;
          if (mes !== ultimoMes) {
            rotulosMes.push({ coluna: s, texto: MESES_CURTOS[mes] });
            ultimoMes = mes;
          }
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      semanas.push(semana);
    }

    return { semanas, rotulosMes, totalDias };
  }, [sessoes]);

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {/* Iniciais dos dias da semana */}
        <div className="flex shrink-0 flex-col gap-[3px] pt-[14px]">
          {DIAS_SEMANA.map((d, i) => (
            <span
              key={i}
              className="h-3 text-[9px] leading-3 text-slate-400"
              aria-hidden="true"
            >
              {i % 2 === 1 ? d : ""}
            </span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {semanas.map((semana, s) => {
            const rotulo = rotulosMes.find((r) => r.coluna === s);
            return (
              <div key={s} className="flex flex-col gap-[3px]">
                <span className="h-3 text-[9px] leading-3 text-slate-400">
                  {rotulo?.texto ?? ""}
                </span>
                {semana.map((dia) => (
                  <span
                    key={dia.iso}
                    title={
                      dia.futuro
                        ? ""
                        : `${dia.iso.slice(8)}/${dia.iso.slice(5, 7)} · ${
                            dia.mins > 0 ? formatarMinutos(dia.mins) : "sem foco"
                          }`
                    }
                    className={`h-3 w-3 rounded-[3px] ${
                      dia.mins > 0 ? "" : "bg-slate-100"
                    } ${dia.futuro ? "opacity-0" : ""}`}
                    style={
                      dia.mins > 0
                        ? {
                            backgroundColor: `rgb(37 99 235 / ${
                              OPACIDADE[intensidade(dia.mins)]
                            })`,
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {totalDias === 0
            ? "Nenhum dia de foco ainda — comece hoje."
            : `${totalDias} ${totalDias === 1 ? "dia" : "dias"} de foco nas últimas ${SEMANAS} semanas`}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">menos</span>
          <span className="h-3 w-3 rounded-[3px] bg-slate-100" />
          {OPACIDADE.slice(1).map((o) => (
            <span
              key={o}
              className="h-3 w-3 rounded-[3px]"
              style={{ backgroundColor: `rgb(37 99 235 / ${o})` }}
            />
          ))}
          <span className="text-[10px] text-slate-400">mais</span>
        </div>
      </div>
    </div>
  );
}
