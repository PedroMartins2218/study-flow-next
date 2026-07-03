"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  atualizarMateria,
  criarMateria,
  removerMateria,
  subscribeToMaterias,
} from "@/lib/data/materias";
import { PageHeader } from "@/components/ui/PageHeader";
import { Botao } from "@/components/ui/Botao";
import { SlideOver } from "@/components/ui/SlideOver";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icone } from "@/components/ui/Icone";
import { ENTIDADES } from "@/lib/ui/entidades";
import type { Materia } from "@/types/studyflow";

export default function MateriasPage() {
  const { user } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToMaterias(user.uid, setMaterias);
  }, [user]);

  function abrirCriar() {
    setEditando(null);
    setErro("");
    setAberto(true);
  }

  function abrirEditar(m: Materia) {
    setEditando(m);
    setErro("");
    setAberto(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    const dados = {
      nome: String(form.get("nome") ?? ""),
      prog: Number(form.get("prog") ?? 0),
    };
    try {
      if (editando) {
        await atualizarMateria(user.uid, editando.id, dados);
      } else {
        await criarMateria(user.uid, dados);
      }
      setAberto(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar matéria.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        titulo="Matérias"
        subtitulo="O que você está estudando e o quanto já avançou."
        acao={
          <Botao icone="livro" onClick={abrirCriar}>
            Nova matéria
          </Botao>
        }
      />

      {materias.length === 0 ? (
        <EmptyState
          icone="livro"
          titulo="Nenhuma matéria ainda"
          descricao="Comece cadastrando a primeira matéria que você está estudando."
          acao={<Botao onClick={abrirCriar}>Adicionar matéria</Botao>}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {materias.map((m) => (
            <li
              key={m.id}
              className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ENTIDADES.materias.chip}`}
                >
                  <Icone nome="livro" className="h-5 w-5" />
                </span>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => abrirEditar(m)}
                    aria-label={`Editar ${m.nome}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Icone nome="caderno" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => user && removerMateria(user.uid, m.id)}
                    aria-label={`Remover ${m.nome}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="mt-3 font-semibold text-slate-900">{m.nome}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${m.prog}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{m.prog}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SlideOver
        aberto={aberto}
        onFechar={() => setAberto(false)}
        titulo={editando ? "Editar matéria" : "Nova matéria"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Nome</label>
            <input
              name="nome"
              required
              key={editando?.id ?? "nova"}
              defaultValue={editando?.nome ?? ""}
              placeholder="Ex.: Matemática"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Progresso (%)
            </label>
            <input
              name="prog"
              type="number"
              min={0}
              max={100}
              key={(editando?.id ?? "nova") + "-prog"}
              defaultValue={editando?.prog ?? 0}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          )}
          <Botao type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar matéria"}
          </Botao>
        </form>
      </SlideOver>
    </div>
  );
}
