"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  criarMateria,
  removerMateria,
  subscribeToMaterias,
} from "@/lib/data/materias";
import type { Materia } from "@/types/studyflow";

export default function MateriasPage() {
  const { user } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToMaterias(user.uid, setMaterias);
  }, [user]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setEnviando(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      await criarMateria(user.uid, {
        nome: String(form.get("nome") ?? ""),
        prog: Number(form.get("prog") ?? 0),
      });
      formEl.reset();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar matéria.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Matérias</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cadastre as matérias que você está estudando e acompanhe o progresso.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row"
      >
        <input
          name="nome"
          required
          placeholder="Nome da matéria"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <input
          name="prog"
          type="number"
          min={0}
          max={100}
          defaultValue={0}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-24"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          Adicionar
        </button>
      </form>

      {erro && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {materias.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex-1">
              <p className="font-medium text-slate-900">{m.nome}</p>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-900"
                  style={{ width: `${m.prog}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => user && removerMateria(user.uid, m.id)}
              className="ml-4 text-xs font-medium text-red-600 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
        {materias.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Nenhuma matéria cadastrada ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
