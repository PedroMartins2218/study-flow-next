"use client";

// Tela genérica de "tarefas com prazo" — usada por Atividades e Trabalhos,
// que têm o mesmo formato (título, matéria, data opcional, concluído).

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { PageHeader } from "@/components/ui/PageHeader";
import { Botao } from "@/components/ui/Botao";
import { SlideOver } from "@/components/ui/SlideOver";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { ENTIDADES } from "@/lib/ui/entidades";
import { formatarDataCurta, hojeISO } from "@/lib/ui/datas";
import type { Materia } from "@/types/studyflow";

export type Tarefa = {
  id: string;
  titulo: string;
  materia: string;
  data?: string;
  feita: boolean;
};

type Config = {
  entidade: "atividades" | "trabalhos";
  titulo: string;
  subtitulo: string;
  rotuloNovo: string;
  rotuloVazio: string;
  descricaoVazio: string;
  placeholderTitulo: string;
  subscribe: (uid: string, onChange: (itens: Tarefa[]) => void) => () => void;
  criar: (uid: string, dados: { titulo: string; materia: string; data: string }) => Promise<void>;
  alternar: (uid: string, id: string, feita: boolean) => Promise<void>;
  remover: (uid: string, id: string) => Promise<void>;
};

function BadgePrazo({ data, feita }: { data?: string; feita: boolean }) {
  if (feita) return <Badge tom="sucesso">Concluída</Badge>;
  if (!data) return <Badge tom="neutro">Sem prazo</Badge>;
  const hoje = hojeISO();
  if (data < hoje) return <Badge tom="perigo">Atrasada</Badge>;
  if (data === hoje) return <Badge tom="alerta">Hoje</Badge>;
  return <Badge tom="neutro">{formatarDataCurta(data)}</Badge>;
}

export function TelaTarefas(config: Config) {
  const { user } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const [itens, setItens] = useState<Tarefa[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { subscribe, criar, alternar, remover } = config;

  useEffect(() => {
    if (!user) return;
    const unsubA = subscribe(user.uid, (lista) => {
      setItens(lista);
      setCarregando(false);
    });
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    return () => {
      unsubA();
      unsubM();
    };
  }, [user, subscribe]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    try {
      await criar(user.uid, {
        titulo: String(form.get("titulo") ?? ""),
        materia: String(form.get("materia") ?? ""),
        data: String(form.get("data") ?? ""),
      });
      toast("Adicionado");
      setAberto(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleAlternar(item: Tarefa) {
    if (!user) return;
    await alternar(user.uid, item.id, !item.feita);
    if (!item.feita) toast("Boa! Concluída");
  }

  async function handleRemover(item: Tarefa) {
    if (!user) return;
    const ok = await confirmar({
      titulo: `Remover “${item.titulo}”?`,
      descricao: "Esta ação não pode ser desfeita.",
      confirmar: "Remover",
      perigo: true,
    });
    if (!ok) return;
    await remover(user.uid, item.id);
    toast("Removido");
  }

  const pendentes = itens.filter((i) => !i.feita);
  const concluidas = itens.filter((i) => i.feita);
  const ent = ENTIDADES[config.entidade];

  function Linha({ item }: { item: Tarefa }) {
    return (
      <li className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md">
        <button
          onClick={() => handleAlternar(item)}
          aria-label={item.feita ? "Marcar como pendente" : "Marcar como concluída"}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
            item.feita
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 text-transparent hover:border-blue-500"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-medium ${
              item.feita ? "text-slate-400 line-through" : "text-slate-900"
            }`}
          >
            {item.titulo}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`h-1.5 w-1.5 rounded-full ${ent.ponto}`} />
            {item.materia}
          </p>
        </div>
        <BadgePrazo data={item.data} feita={item.feita} />
        <button
          onClick={() => handleRemover(item)}
          aria-label={`Remover ${item.titulo}`}
          className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </li>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        titulo={config.titulo}
        subtitulo={config.subtitulo}
        acao={
          <Botao icone={ent.icone} onClick={() => { setErro(""); setAberto(true); }}>
            {config.rotuloNovo}
          </Botao>
        }
      />

      {carregando ? (
        <CardsSkeleton />
      ) : itens.length === 0 ? (
        <EmptyState
          titulo={config.rotuloVazio}
          descricao={config.descricaoVazio}
          acao={<Botao onClick={() => setAberto(true)}>{config.rotuloNovo}</Botao>}
        />
      ) : (
        <>
          <ul className="animate-in space-y-2">
            {pendentes.map((i) => (
              <Linha key={i.id} item={i} />
            ))}
            {pendentes.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400">
                Tudo concluído por aqui. 🎉
              </li>
            )}
          </ul>
          {concluidas.length > 0 && (
            <>
              <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Concluídas ({concluidas.length})
              </h2>
              <ul className="space-y-2">
                {concluidas.map((i) => (
                  <Linha key={i.id} item={i} />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <SlideOver aberto={aberto} onFechar={() => setAberto(false)} titulo={config.rotuloNovo}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Título</label>
            <input
              name="titulo"
              required
              placeholder={config.placeholderTitulo}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Matéria</label>
            <select
              name="materia"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Selecione a matéria</option>
              {materias.map((m) => (
                <option key={m.id} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
            {materias.length === 0 && (
              <p className="mt-1 text-xs text-slate-400">
                Cadastre uma matéria antes, na tela Matérias.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Prazo (opcional)
            </label>
            <input
              name="data"
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          )}
          <Botao type="submit" disabled={enviando || materias.length === 0}>
            {enviando ? "Salvando..." : "Adicionar"}
          </Botao>
        </form>
      </SlideOver>
    </div>
  );
}
