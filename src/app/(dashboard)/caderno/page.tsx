"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  atualizarAnotacao,
  criarAnotacao,
  removerAnotacao,
  subscribeToAnotacoes,
} from "@/lib/data/anotacoes";
import { subscribeToMaterias } from "@/lib/data/materias";
import type { Anotacao, Materia } from "@/types/studyflow";

function formatarData(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function CartaoAnotacao({
  anotacao,
  materias,
  onSalvar,
  onRemover,
}: {
  anotacao: Anotacao;
  materias: Materia[];
  onSalvar: (dados: { titulo: string; materia: string; conteudo: string }) => Promise<void>;
  onRemover: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    const form = new FormData(e.currentTarget);
    try {
      await onSalvar({
        titulo: String(form.get("titulo") ?? ""),
        materia: String(form.get("materia") ?? ""),
        conteudo: String(form.get("conteudo") ?? ""),
      });
      setEditando(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar anotação.");
    } finally {
      setSalvando(false);
    }
  }

  if (editando) {
    return (
      <form
        onSubmit={handleSalvar}
        className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <input
          name="titulo"
          required
          defaultValue={anotacao.titulo}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium outline-none focus:border-slate-500"
        />
        <select
          name="materia"
          defaultValue={anotacao.materia ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        >
          <option value="">Sem matéria</option>
          {materias.map((m) => (
            <option key={m.id} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </select>
        <textarea
          name="conteudo"
          required
          rows={6}
          defaultValue={anotacao.conteudo}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        {erro && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{anotacao.titulo}</p>
          <p className="text-xs text-slate-500">
            {anotacao.materia ? `${anotacao.materia} · ` : ""}
            {formatarData(anotacao.atualizadoEm ?? anotacao.criadoEm)}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => setEditando(true)}
            className="text-xs font-medium text-slate-600 hover:underline"
          >
            Editar
          </button>
          <button
            onClick={onRemover}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Remover
          </button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {anotacao.conteudo}
      </p>
    </div>
  );
}

export default function CadernoPage() {
  const { user } = useAuth();
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [filtroMateria, setFiltroMateria] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubA = subscribeToAnotacoes(user.uid, setAnotacoes);
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
      await criarAnotacao(user.uid, {
        titulo: String(form.get("titulo") ?? ""),
        materia: String(form.get("materia") ?? ""),
        conteudo: String(form.get("conteudo") ?? ""),
      });
      formEl.reset();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar anotação.");
    } finally {
      setEnviando(false);
    }
  }

  const visiveis = filtroMateria
    ? anotacoes.filter((a) => a.materia === filtroMateria)
    : anotacoes;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Caderno de estudos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Suas anotações de estudo, organizadas por matéria.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
      >
        <input
          name="titulo"
          required
          placeholder="Título da anotação"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <select
          name="materia"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        >
          <option value="">Sem matéria</option>
          {materias.map((m) => (
            <option key={m.id} value={m.nome}>
              {m.nome}
            </option>
          ))}
        </select>
        <textarea
          name="conteudo"
          required
          rows={5}
          placeholder="Escreva sua anotação..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {enviando ? "Salvando..." : "Adicionar anotação"}
        </button>
      </form>

      {erro && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      {anotacoes.length > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Filtrar:</label>
          <select
            value={filtroMateria}
            onChange={(e) => setFiltroMateria(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-500"
          >
            <option value="">Todas as matérias</option>
            {materias.map((m) => (
              <option key={m.id} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {visiveis.map((a) => (
          <CartaoAnotacao
            key={a.id}
            anotacao={a}
            materias={materias}
            onSalvar={(dados) => atualizarAnotacao(user!.uid, a.id, dados)}
            onRemover={() => user && removerAnotacao(user.uid, a.id)}
          />
        ))}
        {visiveis.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            {anotacoes.length === 0
              ? "Nenhuma anotação ainda. Escreva a primeira!"
              : "Nenhuma anotação nessa matéria."}
          </div>
        )}
      </div>
    </div>
  );
}
