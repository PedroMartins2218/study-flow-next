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
import { PageHeader } from "@/components/ui/PageHeader";
import { Botao } from "@/components/ui/Botao";
import { SlideOver } from "@/components/ui/SlideOver";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatarDataCurta } from "@/lib/ui/datas";
import type { Anotacao, Materia } from "@/types/studyflow";

export default function CadernoPage() {
  const { user } = useAuth();
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Anotacao | null>(null);
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

  function abrirCriar() {
    setEditando(null);
    setErro("");
    setAberto(true);
  }

  function abrirEditar(a: Anotacao) {
    setEditando(a);
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
      titulo: String(form.get("titulo") ?? ""),
      materia: String(form.get("materia") ?? ""),
      conteudo: String(form.get("conteudo") ?? ""),
    };
    try {
      if (editando) {
        await atualizarAnotacao(user.uid, editando.id, dados);
      } else {
        await criarAnotacao(user.uid, dados);
      }
      setAberto(false);
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
    <div className="mx-auto max-w-3xl">
      <PageHeader
        titulo="Caderno de estudos"
        subtitulo="Suas anotações de estudo, organizadas por matéria."
        acao={
          <Botao icone="caderno" onClick={abrirCriar}>
            Nova anotação
          </Botao>
        }
      />

      {anotacoes.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Filtrar:</label>
          <select
            value={filtroMateria}
            onChange={(e) => setFiltroMateria(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
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

      {anotacoes.length === 0 ? (
        <EmptyState
          icone="caderno"
          titulo="Nenhuma anotação ainda"
          descricao="Guarde aqui os resumos e aprendizados de cada sessão de estudo."
          acao={<Botao onClick={abrirCriar}>Escrever a primeira</Botao>}
        />
      ) : visiveis.length === 0 ? (
        <EmptyState
          icone="caderno"
          titulo="Nada nessa matéria"
          descricao="Nenhuma anotação com esse filtro. Tente outra matéria."
        />
      ) : (
        <ul className="space-y-3">
          {visiveis.map((a) => (
            <li
              key={a.id}
              className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{a.titulo}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {a.materia && <Badge tom="info">{a.materia}</Badge>}
                    <span className="text-xs text-slate-400">
                      {formatarDataCurta(a.atualizadoEm ?? a.criadoEm)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => abrirEditar(a)}
                    aria-label={`Editar ${a.titulo}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => user && removerAnotacao(user.uid, a.id)}
                    aria-label={`Remover ${a.titulo}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {a.conteudo}
              </p>
            </li>
          ))}
        </ul>
      )}

      <SlideOver
        aberto={aberto}
        onFechar={() => setAberto(false)}
        titulo={editando ? "Editar anotação" : "Nova anotação"}
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Título</label>
            <input
              name="titulo"
              required
              key={(editando?.id ?? "nova") + "-titulo"}
              defaultValue={editando?.titulo ?? ""}
              placeholder="Ex.: Resumo de funções"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Matéria (opcional)
            </label>
            <select
              name="materia"
              key={(editando?.id ?? "nova") + "-materia"}
              defaultValue={editando?.materia ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Sem matéria</option>
              {materias.map((m) => (
                <option key={m.id} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col">
            <label className="mb-1 block text-xs font-medium text-slate-500">Anotação</label>
            <textarea
              name="conteudo"
              required
              rows={10}
              key={(editando?.id ?? "nova") + "-conteudo"}
              defaultValue={editando?.conteudo ?? ""}
              placeholder="Escreva sua anotação..."
              className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          )}
          <Botao type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar anotação"}
          </Botao>
        </form>
      </SlideOver>
    </div>
  );
}
