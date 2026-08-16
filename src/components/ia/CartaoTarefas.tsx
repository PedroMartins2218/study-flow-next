"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { criarAtividade } from "@/lib/data/atividades";
import { criarTrabalho } from "@/lib/data/trabalhos";
import { criarProva } from "@/lib/data/provas";
import { formatarDataCurta } from "@/lib/ui/datas";
import type { TarefaExtraida } from "@/lib/validators/studyflow";

const ROTULO: Record<TarefaExtraida["tipo"], string> = {
  atividade: "Atividade",
  trabalho: "Trabalho",
  prova: "Prova",
};

const COR: Record<TarefaExtraida["tipo"], string> = {
  atividade: "bg-emerald-50 text-emerald-700",
  trabalho: "bg-amber-50 text-amber-700",
  prova: "bg-rose-50 text-rose-700",
};

/**
 * Cartão de confirmação das tarefas que o assistente identificou na conversa.
 * O agente nunca grava sozinho: quem decide é a pessoa.
 */
export function CartaoTarefas({ tarefas }: { tarefas: TarefaExtraida[] }) {
  const { user } = useAuth();
  const toast = useToast();
  const [salvando, setSalvando] = useState(false);
  const [salvas, setSalvas] = useState(false);
  // Itens que o usuário desmarcou antes de salvar.
  const [ignorados, setIgnorados] = useState<Set<number>>(new Set());

  function alternar(i: number) {
    setIgnorados((atual) => {
      const novo = new Set(atual);
      if (novo.has(i)) novo.delete(i);
      else novo.add(i);
      return novo;
    });
  }

  const selecionadas = tarefas.filter((_, i) => !ignorados.has(i));

  async function salvar() {
    if (!user || selecionadas.length === 0) return;

    // Prova sem data não passa na validação da camada de dados — avisa antes de
    // gravar qualquer coisa, para não salvar pela metade.
    const semData = selecionadas.find((t) => t.tipo === "prova" && !t.data);
    if (semData) {
      toast(`A prova "${semData.titulo}" está sem data. Peça a data ao agente.`, "erro");
      return;
    }

    setSalvando(true);
    try {
      for (const t of selecionadas) {
        if (t.tipo === "prova") {
          await criarProva(user.uid, {
            titulo: t.titulo,
            tipo: "Prova",
            materia: t.materia,
            data: t.data ?? "",
          });
        } else if (t.tipo === "trabalho") {
          await criarTrabalho(user.uid, {
            titulo: t.titulo,
            materia: t.materia,
            data: t.data ?? "",
          });
        } else {
          await criarAtividade(user.uid, {
            titulo: t.titulo,
            materia: t.materia,
            data: t.data ?? "",
          });
        }
      }
      setSalvas(true);
      toast(
        `${selecionadas.length} ${selecionadas.length === 1 ? "item salvo" : "itens salvos"}!`
      );
    } catch {
      toast("Não foi possível salvar. Confira as matérias e tente de novo.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  // `bg-slate-50` sem opacidade: o tema escuro só sobrescreve o nome exato da
  // classe, e `bg-slate-50/70` ficaria clara no escuro.
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-700">
        {salvas ? "Adicionado à sua agenda" : "Quer adicionar à sua agenda?"}
      </p>

      <ul className="mt-2 flex flex-col gap-1.5">
        {tarefas.map((t, i) => {
          const fora = ignorados.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => !salvas && alternar(i)}
                disabled={salvas}
                className={`flex w-full items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-left ring-1 transition ${
                  fora ? "opacity-40 ring-slate-200" : "ring-slate-200 hover:ring-slate-300"
                } ${salvas ? "cursor-default" : ""}`}
              >
                {!salvas && (
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition ${
                      fora ? "border-slate-300" : "border-blue-600 bg-blue-600 text-white"
                    }`}
                  >
                    {!fora && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-2.5 w-2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                )}
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${COR[t.tipo]}`}>
                  {ROTULO[t.tipo]}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-700">
                  {t.titulo}
                  <span className="text-slate-400"> · {t.materia}</span>
                </span>
                {t.data && (
                  <span className="shrink-0 text-[11px] tabular-nums text-slate-500">
                    {formatarDataCurta(t.data)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {!salvas && (
        <button
          onClick={salvar}
          disabled={salvando || selecionadas.length === 0}
          className="mt-2.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {salvando
            ? "Salvando..."
            : selecionadas.length === 0
              ? "Nada selecionado"
              : `Adicionar ${selecionadas.length} ${selecionadas.length === 1 ? "item" : "itens"}`}
        </button>
      )}
    </div>
  );
}
