"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { registrarSessao, subscribeToSessoes } from "@/lib/data/sessoesFoco";
import type { Materia, SessaoFoco } from "@/types/studyflow";

const DURACAO_PADRAO_MIN = 25;

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

  function handlePausar() {
    setAtivo(false);
  }

  async function handleParar() {
    if (tempoTotalSegundos.current === segundosRestantes) {
      setAtivo(false);
      return;
    }
    await finalizarSessao();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Modo foco</h1>
      <p className="mt-1 text-sm text-slate-500">
        Um ciclo de {DURACAO_PADRAO_MIN} minutos, sem distração.
      </p>

      <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <select
          value={materiaSelecionada}
          onChange={(e) => setMateriaSelecionada(e.target.value)}
          disabled={ativo}
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-60"
        >
          <option value="">Selecione a matéria</option>
          {materias.map((m) => (
            <option key={m.id} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </select>

        <div className="flex h-48 w-48 items-center justify-center rounded-full border-8 border-slate-100">
          <span className="text-4xl font-semibold text-slate-900">
            {formatarTempo(segundosRestantes)}
          </span>
        </div>

        {erro && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
        )}

        <div className="flex gap-3">
          {!ativo ? (
            <button
              onClick={handleIniciar}
              className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Iniciar
            </button>
          ) : (
            <button
              onClick={handlePausar}
              className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Pausar
            </button>
          )}
          <button
            onClick={handleParar}
            className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Encerrar e salvar
          </button>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-slate-700">
        Sessões recentes
      </h2>
      <ul className="mt-2 space-y-2">
        {sessoes.slice(0, 8).map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
          >
            <span className="text-sm text-slate-900">{s.materia}</span>
            <span className="text-xs text-slate-500">
              {s.mins} min · {s.data} {s.hora}
            </span>
          </li>
        ))}
        {sessoes.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Nenhuma sessão registrada ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
