"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { registrarSessao, subscribeToSessoes } from "@/lib/data/sessoesFoco";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icone } from "@/components/ui/Icone";
import { ENTIDADES } from "@/lib/ui/entidades";
import { hojeISO } from "@/lib/ui/datas";
import type { Materia, SessaoFoco } from "@/types/studyflow";

const DURACOES_MIN = [15, 25, 50];
const DURACAO_PADRAO_MIN = 25;

// Geometria do anel de progresso
const RAIO = 80;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(segundos % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function FocoPage() {
  const { user } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [sessoes, setSessoes] = useState<SessaoFoco[]>([]);
  const [materiaSelecionada, setMateriaSelecionada] = useState("");
  const [segundosRestantes, setSegundosRestantes] = useState(DURACAO_PADRAO_MIN * 60);
  const [ativo, setAtivo] = useState(false);
  const [erro, setErro] = useState("");
  const tempoTotalSegundos = useRef(DURACAO_PADRAO_MIN * 60);

  useEffect(() => {
    if (!user) return;
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    const unsubS = subscribeToSessoes(user.uid, setSessoes);
    return () => {
      unsubM();
      unsubS();
    };
  }, [user]);

  useEffect(() => {
    if (!ativo) return;
    const intervalo = setInterval(() => {
      setSegundosRestantes((atual) => Math.max(0, atual - 1));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [ativo]);

  useEffect(() => {
    if (ativo && segundosRestantes === 0) {
      void finalizarSessao();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundosRestantes]);

  async function finalizarSessao() {
    setAtivo(false);
    const segundosDecorridos = tempoTotalSegundos.current - segundosRestantes;
    const mins = Math.round(segundosDecorridos / 60);
    setSegundosRestantes(tempoTotalSegundos.current);
    if (!user || mins < 1) return;
    try {
      await registrarSessao(user.uid, { materia: materiaSelecionada, mins });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar sessão.");
    }
  }

  function handleIniciar() {
    if (!materiaSelecionada) {
      setErro("Selecione uma matéria antes de iniciar.");
      return;
    }
    setErro("");
    setAtivo(true);
  }

  function handleDuracao(min: number) {
    tempoTotalSegundos.current = min * 60;
    setSegundosRestantes(min * 60);
  }

  async function handleParar() {
    if (tempoTotalSegundos.current === segundosRestantes) {
      setAtivo(false);
      return;
    }
    await finalizarSessao();
  }

  const emAndamento = segundosRestantes !== tempoTotalSegundos.current;
  const fracao =
    (tempoTotalSegundos.current - segundosRestantes) / tempoTotalSegundos.current;
  const hoje = hojeISO();
  const sessoesHoje = sessoes.filter((s) => s.data === hoje);
  const minutosHoje = sessoesHoje.reduce((soma, s) => soma + s.mins, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        titulo="Modo foco"
        subtitulo="Um ciclo de estudo sem distração. Escolha a matéria e comece."
      />

      <div className="flex flex-col items-center rounded-3xl bg-slate-950 p-8 shadow-lg sm:p-10">
        <select
          value={materiaSelecionada}
          onChange={(e) => setMateriaSelecionada(e.target.value)}
          disabled={ativo}
          className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-center text-sm text-slate-200 outline-none focus:border-blue-500 disabled:opacity-60"
        >
          <option value="">Selecione a matéria</option>
          {materias.map((m) => (
            <option key={m.id} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </select>

        {/* Seleção de duração (só quando parado e sem progresso) */}
        {!ativo && !emAndamento && (
          <div className="mt-5 flex gap-2">
            {DURACOES_MIN.map((min) => (
              <button
                key={min}
                onClick={() => handleDuracao(min)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  tempoTotalSegundos.current === min * 60
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        )}

        {/* Anel de progresso */}
        <div className="relative mt-6 h-[190px] w-[190px]">
          <svg width="190" height="190" viewBox="0 0 190 190" className="-rotate-90">
            <circle cx="95" cy="95" r={RAIO} fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle
              cx="95"
              cy="95"
              r={RAIO}
              fill="none"
              stroke="#2563eb"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={CIRCUNFERENCIA * (1 - fracao)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-semibold tabular-nums text-white">
              {formatarTempo(segundosRestantes)}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              {ativo ? "focado..." : emAndamento ? "pausado" : "pronto para começar"}
            </span>
          </div>
        </div>

        {erro && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{erro}</p>
        )}

        {/* Controles */}
        <div className="mt-6 flex items-center gap-5">
          {!ativo ? (
            <button
              onClick={handleIniciar}
              aria-label="Iniciar foco"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7">
                <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setAtivo(false)}
              aria-label="Pausar foco"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M7 5a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1H8a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V5z" />
              </svg>
            </button>
          )}
          {emAndamento && (
            <button
              onClick={handleParar}
              className="rounded-full bg-slate-800 px-5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              Encerrar e salvar
            </button>
          )}
        </div>

        {/* Sessões de hoje */}
        <div className="mt-7 flex items-center gap-2">
          {Array.from({ length: Math.max(4, Math.min(sessoesHoje.length, 8)) }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < sessoesHoje.length ? "bg-blue-500" : "bg-slate-800"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {sessoesHoje.length === 0
            ? "Nenhuma sessão hoje ainda"
            : `${sessoesHoje.length} ${sessoesHoje.length === 1 ? "sessão" : "sessões"} hoje · ${minutosHoje} min`}
        </p>
      </div>

      <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Sessões recentes
      </h2>
      {sessoes.length === 0 ? (
        <EmptyState
          icone="relogio"
          titulo="Nenhuma sessão registrada"
          descricao="Complete seu primeiro ciclo de foco e ele aparece aqui."
        />
      ) : (
        <ul className="space-y-2">
          {sessoes.slice(0, 8).map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80"
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${ENTIDADES.foco.chip}`}
              >
                <Icone nome="relogio" className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-slate-900">{s.materia}</span>
              <span className="text-xs text-slate-500">
                {s.mins} min · {s.data.split("-").reverse().slice(0, 2).join("/")} {s.hora}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
