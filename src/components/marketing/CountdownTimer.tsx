"use client";

import { useSyncExternalStore } from "react";

// Data prevista de lançamento: 06/07/2026, horário de Brasília (-03:00).
const ALVO = new Date("2026-07-06T00:00:00-03:00").getTime();

// Fonte externa (relógio): o snapshot só muda a cada tick do intervalo.
let msRestante = ALVO - Date.now();

function subscribe(onChange: () => void) {
  const id = setInterval(() => {
    msRestante = ALVO - Date.now();
    onChange();
  }, 1000);
  return () => clearInterval(id);
}

const getSnapshot = () => msRestante;
// No servidor renderizamos placeholders; o cliente assume o valor real após montar.
const getServerSnapshot = (): number | null => null;

type Restante = { dias: string; horas: string; minutos: string; segundos: string };

function decompor(ms: number): Restante {
  const s = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dias: pad(Math.floor(s / 86400)),
    horas: pad(Math.floor((s % 86400) / 3600)),
    minutos: pad(Math.floor((s % 3600) / 60)),
    segundos: pad(s % 60),
  };
}

const CAMPOS: { chave: keyof Restante; rotulo: string }[] = [
  { chave: "dias", rotulo: "Dias" },
  { chave: "horas", rotulo: "Horas" },
  { chave: "minutos", rotulo: "Minutos" },
  { chave: "segundos", rotulo: "Segundos" },
];

export function CountdownTimer() {
  const ms = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (ms !== null && ms <= 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        O Study Flow já está no ar!
      </div>
    );
  }

  const restante = ms === null ? null : decompor(ms);

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 motion-safe:animate-pulse" />
        Lançamento em
      </span>
      <div className="flex items-center gap-2 sm:gap-3">
        {CAMPOS.map(({ chave, rotulo }) => (
          <div
            key={chave}
            className="flex min-w-16 flex-col items-center rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-200 sm:min-w-[76px] sm:px-4 sm:py-3"
          >
            <span className="text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
              {restante ? restante[chave] : "--"}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
              {rotulo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
