"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  alternarTrabalho,
  criarTrabalho,
  removerTrabalho,
  subscribeToTrabalhos,
} from "@/lib/data/trabalhos";
import { subscribeToMaterias } from "@/lib/data/materias";
import type { Materia, Trabalho } from "@/types/studyflow";

export default function TrabalhosPage() {
  const { user } = useAuth();
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubT = subscribeToTrabalhos(user.uid, setTrabalhos);
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    return () => {
      unsubT();
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
      await criarTrabalho(user.uid, {
        titulo: String(form.get("titulo") ?? ""),
        materia: String(form.get("materia") ?? ""),
        data: String(form.get("data") ?? ""),
      });
      formEl.reset();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar trabalho.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Trabalhos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Trabalhos e entregas que você precisa cumprir.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <input
          name="titulo"
          required
          placeholder="Título do trabalho"
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
            Cadastre uma matéria antes de criar trabalhos.
          </p>
        )}
      </form>

      {erro && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {trabalhos.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <input
              type="checkbox"
              checked={t.concluido}
              onChange={() =>
                user && alternarTrabalho(user.uid, t.id, !t.concluido)
              }
              className="h-4 w-4"
            />
            <div className="flex-1">
              <p
                className={`font-medium ${
                  t.concluido ? "text-slate-400 line-through" : "text-slate-900"
                }`}
              >
                {t.titulo}
              </p>
              <p className="text-xs text-slate-500">
                {t.materia}
                {t.data ? ` · ${t.data}` : ""}
              </p>
            </div>
            <button
              onClick={() => user && removerTrabalho(user.uid, t.id)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
        {trabalhos.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Nenhum trabalho cadastrado ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
