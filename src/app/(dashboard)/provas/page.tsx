"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { criarProva, removerProva, subscribeToProvas } from "@/lib/data/provas";
import { subscribeToMaterias } from "@/lib/data/materias";
import type { Materia, Prova } from "@/types/studyflow";

const TIPOS = ["Prova", "Simulado"];

export default function ProvasPage() {
  const { user } = useAuth();
  const [provas, setProvas] = useState<Prova[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubP = subscribeToProvas(user.uid, setProvas);
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    return () => {
      unsubP();
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
      await criarProva(user.uid, {
        titulo: String(form.get("titulo") ?? ""),
        tipo: String(form.get("tipo") ?? ""),
        materia: String(form.get("materia") ?? ""),
        data: String(form.get("data") ?? ""),
      });
      formEl.reset();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar prova.");
    } finally {
      setEnviando(false);
    }
  }

  const hoje = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Provas e simulados</h1>
      <p className="mt-1 text-sm text-slate-500">
        Datas que você precisa ter na cabeça.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <input
          name="titulo"
          required
          placeholder="Título (ex: Prova bimestral)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            name="tipo"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <button
          type="submit"
          disabled={enviando || materias.length === 0}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          Adicionar
        </button>
        {materias.length === 0 && (
          <p className="text-xs text-slate-400">
            Cadastre uma matéria antes de agendar provas.
          </p>
        )}
      </form>

      {erro && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {provas.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div>
              <p className="font-medium text-slate-900">{p.titulo}</p>
              <p className="text-xs text-slate-500">
                {p.tipo} · {p.materia} · {p.data}
                {p.data < hoje ? " · encerrada" : ""}
              </p>
            </div>
            <button
              onClick={() => user && removerProva(user.uid, p.id)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remover
            </button>
          </li>
        ))}
        {provas.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            Nenhuma prova agendada.
          </li>
        )}
      </ul>
    </div>
  );
}
