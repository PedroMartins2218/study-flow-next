"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  alternarAtividade,
  criarAtividade,
  removerAtividade,
  subscribeToAtividades,
} from "@/lib/data/atividades";
import { subscribeToMaterias } from "@/lib/data/materias";
import type { Atividade, Materia } from "@/types/studyflow";

export default function AtividadesPage() {
  const { user } = useAuth();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubA = subscribeToAtividades(user.uid, setAtividades);
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    return () => {
      unsubA();
      unsubM();
    };
  }, [user]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setEnviando(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      await criarAtividade(user.uid, {
        titulo: String(form.get("titulo") ?? ""),
        materia: String(form.get("materia") ?? ""),
        data: String(form.get("data") ?? ""),
      });
      formEl.reset();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar atividade.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">
        Atividades de estudo
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        O que precisa ser feito hoje e nos próximos dias.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <input
          name="titulo"
          required
          placeholder="O que você precisa fazer?"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            name="materia"
            required
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Selecione a matéria</option>
            {materias.map((m) => (
              <option key={m.id} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>
          <input
            name="data"
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={enviando || materias.length === 0}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            Adicionar
          </button>
        </div>
        {materias.length === 0 && (
          <p className="text-xs text-slate-400">
            Cadastre uma matéria antes de criar atividades.
          </p>
        )}
      </form>

      {erro && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {atividades.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <input
              type="checkbox"
              checked={a.concluida}
              onChange={() =>
                user && alternarAtividade(user.uid, a.id, !a.concluida)
              }
              className="h-4 w-4"
            />
            <div className="flex-1">
              <p
                className={`font-medium ${
                  a.concluida ? "text-slate-400 line-through" : "text-slate-900"
                }`}
              >
                {a.titulo}
              </p>
              <p className="text-xs text-slate-500">
                {a.materia}
                {a.data ? ` · ${a.data}` : ""}
              </p>
            </div>
            <button
              onClick={() => user && removerAtividade(user.uid, a.id)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
        {atividades.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Nenhuma atividade cadastrada ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
