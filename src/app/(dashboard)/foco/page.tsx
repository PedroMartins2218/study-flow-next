"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { registrarSessao, subscribeToSessoes } from "@/lib/data/sessoesFoco";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icone } from "@/components/ui/Icone";
import { useToast } from "@/components/ui/Toast";
import { ENTIDADES } from "@/lib/ui/entidades";
import { hojeISO } from "@/lib/ui/datas";
import type { Materia, SessaoFoco } from "@/types/dominio";

const DURACOES_MIN = [15, 25, 30, 50];
const DURACAO_PADRAO_MIN = 25;
const DESCANSOS_MIN = [5, 10, 15];
const DESCANSO_MAX_MIN = 60;

const RAIO = 80;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

type Fase = "foco" | "descanso";

/**
 * Instante em que um bloco de N segundos termina.
 * Fora do componente de propósito: `Date.now()` é impuro e não pode ser
 * chamado no corpo de um componente React.
 */
function instanteDeTermino(segundos: number): number {
  return Date.now() + segundos * 1000;
}

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
  const toast = useToast();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [sessoes, setSessoes] = useState<SessaoFoco[]>([]);
  const [materiaSelecionada, setMateriaSelecionada] = useState("");

  const [fase, setFase] = useState<Fase>("foco");
  const [duracaoSegundos, setDuracaoSegundos] = useState(DURACAO_PADRAO_MIN * 60);
  const [segundosRestantes, setSegundosRestantes] = useState(DURACAO_PADRAO_MIN * 60);
  /**
   * Instante em que o bloco termina (ms). É a fonte da verdade do cronômetro.
   *
   * Antes o tempo era contado somando tiques de setInterval, o que quebrava com
   * a tela do celular bloqueada: o navegador congela o timer e o bloco nunca
   * terminava. Olhando o relógio, tique perdido não atrasa nada.
   */
  const [fimEm, setFimEm] = useState<number | null>(null);

  const [concluida, setConcluida] = useState<number | null>(null);
  const [descansoTerminado, setDescansoTerminado] = useState(false);
  const [descansoCustom, setDescansoCustom] = useState("");
  const [erro, setErro] = useState("");

  const audioRef = useRef<AudioContext | null>(null);
  // Evita concluir duas vezes se o tique e o visibilitychange caírem juntos.
  const concluindoRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    const unsubS = subscribeToSessoes(user.uid, setSessoes);
    return () => {
      unsubM();
      unsubS();
    };
  }, [user]);

  function tocarSino() {
    try {
      const ctx = audioRef.current;
      if (!ctx) return;
      const notas = [880, 1174];
      notas.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t0 = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.42);
      });
    } catch {
      // som é opcional; ignora se o navegador bloquear
    }
  }

  function notificar(titulo: string, corpo: string) {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(titulo, { body: corpo });
      }
    } catch {
      // notificação é opcional
    }
  }

  /** Prepara áudio e notificação. Precisa rodar dentro do gesto do usuário. */
  function prepararAvisos() {
    try {
      if (!audioRef.current && typeof AudioContext !== "undefined") {
        audioRef.current = new AudioContext();
      }
      void audioRef.current?.resume();
    } catch {
      // sem áudio, tudo bem
    }
    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }

  const concluirBloco = useCallback(
    async (segundosSobrando: number) => {
      if (concluindoRef.current) return;
      concluindoRef.current = true;
      setFimEm(null);

      const decorridos = duracaoSegundos - segundosSobrando;

      try {
        if (fase === "descanso") {
          tocarSino();
          notificar("Descanso terminado", "Bora para o próximo bloco de foco?");
          setDescansoTerminado(true);
          return;
        }

        const mins = Math.round(decorridos / 60);
        setSegundosRestantes(duracaoSegundos);
        // Menos de um minuto não vira sessão — evita poluir o histórico.
        if (!user || mins < 1) return;

        await registrarSessao(user.uid, { materia: materiaSelecionada, mins });
        tocarSino();
        notificar("Sessão de foco concluída!", `${mins} min de ${materiaSelecionada} registrados.`);
        toast(`Sessão de ${mins} min registrada`);
        setConcluida(mins);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao salvar sessão.");
      } finally {
        concluindoRef.current = false;
      }
    },
    [duracaoSegundos, fase, materiaSelecionada, user, toast]
  );

  /**
   * Enquanto o bloco roda, só recalcula o restante a partir de `fimEm`.
   * O `visibilitychange` cobre o retorno do celular bloqueado: a tela já volta
   * com o tempo certo, mesmo que o navegador tenha congelado os tiques.
   */
  useEffect(() => {
    if (fimEm === null) return;

    const atualizar = () => {
      const restante = Math.max(0, Math.ceil((fimEm - Date.now()) / 1000));
      setSegundosRestantes(restante);
      if (restante === 0) void concluirBloco(0);
    };

    const id = setInterval(atualizar, 500);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, [fimEm, concluirBloco]);

  function iniciarFoco() {
    if (!materiaSelecionada) {
      setErro("Selecione uma matéria antes de iniciar.");
      return;
    }
    setErro("");
    prepararAvisos();
    setFimEm(instanteDeTermino(segundosRestantes));
  }

  function pausar() {
    setFimEm(null);
  }

  function escolherDuracao(min: number) {
    setDuracaoSegundos(min * 60);
    setSegundosRestantes(min * 60);
  }

  async function encerrarEsalvar() {
    if (fimEm === null && segundosRestantes === duracaoSegundos) return;
    await concluirBloco(segundosRestantes);
  }

  function iniciarDescanso(min: number) {
    prepararAvisos();
    setFase("descanso");
    setDuracaoSegundos(min * 60);
    setSegundosRestantes(min * 60);
    setConcluida(null);
    setErro("");
    setFimEm(instanteDeTermino(min * 60));
  }

  function iniciarDescansoCustom() {
    const min = Number(descansoCustom);
    if (!Number.isFinite(min) || min < 1 || min > DESCANSO_MAX_MIN) {
      setErro(`Escolha um descanso entre 1 e ${DESCANSO_MAX_MIN} minutos.`);
      return;
    }
    setDescansoCustom("");
    iniciarDescanso(Math.floor(min));
  }

  /** Volta ao estado inicial de foco (usado ao pular ou encerrar o descanso). */
  function voltarAoFoco() {
    setFase("foco");
    setFimEm(null);
    setDuracaoSegundos(DURACAO_PADRAO_MIN * 60);
    setSegundosRestantes(DURACAO_PADRAO_MIN * 60);
    setConcluida(null);
    setDescansoTerminado(false);
    setErro("");
  }

  const rodando = fimEm !== null;
  const emAndamento = segundosRestantes !== duracaoSegundos;
  const fracao = (duracaoSegundos - segundosRestantes) / duracaoSegundos;
  const ehDescanso = fase === "descanso";

  const hoje = hojeISO();
  const sessoesHoje = sessoes.filter((s) => s.data === hoje);
  const minutosHoje = sessoesHoje.reduce((soma, s) => soma + s.mins, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        titulo="Modo foco"
        subtitulo="Um ciclo de estudo sem distração. Escolha a matéria e comece."
      />

      <div className="animate-in flex flex-col items-center rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200/80 sm:p-10">
        {concluida !== null ? (
          // Bloco de foco concluído → oferece o descanso
          <div className="flex w-full max-w-sm flex-col items-center py-4 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Icone nome="check" className="h-8 w-8" />
            </span>
            <p className="mt-4 text-xl font-semibold text-slate-900">Sessão concluída!</p>
            <p className="mt-1 text-sm text-slate-500">
              {concluida} min de {materiaSelecionada} registrados.
            </p>

            <div className="mt-6 w-full rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Fazer uma pausa?</p>
              <div className="mt-3 flex justify-center gap-2">
                {DESCANSOS_MIN.map((min) => (
                  <button
                    key={min}
                    onClick={() => iniciarDescanso(min)}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200"
                  >
                    {min} min
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={DESCANSO_MAX_MIN}
                  value={descansoCustom}
                  onChange={(e) => setDescansoCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") iniciarDescansoCustom();
                  }}
                  placeholder="outro"
                  aria-label="Minutos de descanso"
                  className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-center text-xs outline-none focus:border-emerald-500"
                />
                <button
                  onClick={iniciarDescansoCustom}
                  disabled={!descansoCustom}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
                >
                  Descansar
                </button>
              </div>
            </div>

            {erro && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
            )}

            <button
              onClick={voltarAoFoco}
              className="mt-4 text-xs font-medium text-slate-500 transition hover:text-slate-800"
            >
              Pular a pausa e começar outro bloco
            </button>
          </div>
        ) : descansoTerminado ? (
          // Descanso concluído → volta para o foco
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
              <Icone nome="alvo" className="h-8 w-8" />
            </span>
            <p className="mt-4 text-xl font-semibold text-slate-900">Descanso terminado</p>
            <p className="mt-1 text-sm text-slate-500">Pronto para o próximo bloco?</p>
            <button
              onClick={voltarAoFoco}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Voltar ao foco
            </button>
          </div>
        ) : (
          <>
            {ehDescanso ? (
              <span className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                Modo descanso
              </span>
            ) : (
              <select
                value={materiaSelecionada}
                onChange={(e) => setMateriaSelecionada(e.target.value)}
                disabled={rodando}
                className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-center text-sm text-slate-700 outline-none focus:border-blue-500 disabled:opacity-60"
              >
                <option value="">Selecione a matéria</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.nome}>
                    {m.nome}
                  </option>
                ))}
              </select>
            )}

            {!ehDescanso && !rodando && !emAndamento && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {DURACOES_MIN.map((min) => (
                  <button
                    key={min}
                    onClick={() => escolherDuracao(min)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      duracaoSegundos === min * 60
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            )}

            <div className="relative mt-6 h-[190px] w-[190px]">
              <svg width="190" height="190" viewBox="0 0 190 190" className="-rotate-90">
                <circle cx="95" cy="95" r={RAIO} fill="none" style={{ stroke: "var(--sf-ring-track)" }} strokeWidth="10" />
                <circle
                  cx="95"
                  cy="95"
                  r={RAIO}
                  fill="none"
                  stroke={ehDescanso ? "#10b981" : "#2563eb"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUNFERENCIA}
                  strokeDashoffset={CIRCUNFERENCIA * (1 - fracao)}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-semibold tabular-nums text-slate-900">
                  {formatarTempo(segundosRestantes)}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  {rodando
                    ? ehDescanso
                      ? "descansando..."
                      : "focado..."
                    : emAndamento
                      ? "pausado"
                      : "pronto para começar"}
                </span>
              </div>
            </div>

            {erro && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
            )}

            <div className="mt-6 flex items-center gap-5">
              {!rodando ? (
                <button
                  onClick={ehDescanso ? () => setFimEm(instanteDeTermino(segundosRestantes)) : iniciarFoco}
                  aria-label={ehDescanso ? "Retomar descanso" : "Iniciar foco"}
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition ${
                    ehDescanso
                      ? "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500"
                      : "bg-blue-600 shadow-blue-600/30 hover:bg-blue-500"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7">
                    <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={pausar}
                  aria-label="Pausar"
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition ${
                    ehDescanso
                      ? "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500"
                      : "bg-blue-600 shadow-blue-600/30 hover:bg-blue-500"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                    <path d="M7 5a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1H8a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V5z" />
                  </svg>
                </button>
              )}

              {ehDescanso ? (
                <button
                  onClick={voltarAoFoco}
                  className="rounded-full bg-slate-100 px-5 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                >
                  Encerrar descanso
                </button>
              ) : (
                emAndamento && (
                  <button
                    onClick={encerrarEsalvar}
                    className="rounded-full bg-slate-100 px-5 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                  >
                    Encerrar e salvar
                  </button>
                )
              )}
            </div>

            <div className="mt-7 flex items-center gap-2">
              {Array.from({ length: Math.max(4, Math.min(sessoesHoje.length, 8)) }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${i < sessoesHoje.length ? "bg-blue-500" : "bg-slate-200"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {sessoesHoje.length === 0
                ? "Nenhuma sessão hoje ainda"
                : `${sessoesHoje.length} ${sessoesHoje.length === 1 ? "sessão" : "sessões"} hoje · ${minutosHoje} min`}
            </p>
          </>
        )}
      </div>

      <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Sessões recentes
      </h2>
      {sessoes.length === 0 ? (
        <EmptyState
          ilustrado={false}
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
