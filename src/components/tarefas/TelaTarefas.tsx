"use client";

// Quadro de tarefas com prazo — usado por Atividades e Trabalhos, que têm o
// mesmo formato (título, matéria, data opcional, etapa).
//
// Três colunas: a fazer, fazendo e a última, cujo rótulo muda por tela
// ("Concluído" em atividades, "Entregue" em trabalhos).

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { PageHeader } from "@/components/ui/PageHeader";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { ENTIDADES } from "@/lib/ui/entidades";
import { formatarDataCurta, hojeISO } from "@/lib/ui/datas";
import type { Materia, SituacaoTarefa } from "@/types/studyflow";

export type Tarefa = {
  id: string;
  titulo: string;
  materia: string;
  data?: string;
  situacao: SituacaoTarefa;
};

type Config = {
  entidade: "atividades" | "trabalhos";
  titulo: string;
  subtitulo: string;
  rotuloNovo: string;
  rotuloVazio: string;
  descricaoVazio: string;
  placeholderTitulo: string;
  /** Nome da última coluna: "Concluído" ou "Entregue". */
  rotuloFeito: string;
  subscribe: (uid: string, onChange: (itens: Tarefa[]) => void) => () => void;
  criar: (uid: string, dados: { titulo: string; materia: string; data: string }) => Promise<void>;
  atualizar: (
    uid: string,
    id: string,
    dados: { titulo: string; materia: string; data: string }
  ) => Promise<void>;
  mover: (uid: string, id: string, situacao: SituacaoTarefa) => Promise<void>;
  remover: (uid: string, id: string) => Promise<void>;
};

const ORDEM: SituacaoTarefa[] = ["afazer", "fazendo", "feito"];

// As três colunas usam o MESMO fundo; quem diferencia é o ponto colorido.
//
// Não trocar por tons como `bg-blue-50/60`: o tema escuro (globals.css)
// sobrescreve pelo nome exato da classe — só `bg-slate-50` e `bg-slate-100`
// têm regra. Qualquer outro tom, inclusive `bg-slate-50/60` com opacidade,
// fica claro no escuro e apaga o texto do cabeçalho.
const CORES: Record<SituacaoTarefa, string> = {
  afazer: "bg-slate-400",
  fazendo: "bg-blue-500",
  feito: "bg-emerald-500",
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
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  /** Item sendo arrastado (só desktop) e coluna sob o cursor. */
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<SituacaoTarefa | null>(null);

  const { subscribe, criar, atualizar, mover, remover } = config;

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

  function abrirCriar() {
    setEditando(null);
    setErro("");
    setAberto(true);
  }

  function abrirEditar(item: Tarefa) {
    setEditando(item);
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
      data: String(form.get("data") ?? ""),
    };
    try {
      if (editando) {
        await atualizar(user.uid, editando.id, dados);
        toast("Alterações salvas");
      } else {
        await criar(user.uid, dados);
        toast("Adicionado");
      }
      setAberto(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleMover(item: Tarefa, situacao: SituacaoTarefa) {
    if (!user || situacao === item.situacao) return;
    // Otimista: o cartão pula de coluna na hora, sem esperar o Firestore.
    setItens((atual) =>
      atual.map((i) => (i.id === item.id ? { ...i, situacao } : i))
    );
    try {
      await mover(user.uid, item.id, situacao);
      if (situacao === "feito") toast(`Boa! ${config.rotuloFeito}`);
    } catch {
      setItens((atual) =>
        atual.map((i) => (i.id === item.id ? { ...i, situacao: item.situacao } : i))
      );
      toast("Não foi possível mover", "erro");
    }
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

  const ent = ENTIDADES[config.entidade];
  const rotulos: Record<SituacaoTarefa, string> = {
    afazer: "A fazer",
    fazendo: "Fazendo",
    feito: config.rotuloFeito,
  };

  function Cartao({ item }: { item: Tarefa }) {
    const indice = ORDEM.indexOf(item.situacao);
    const anterior = ORDEM[indice - 1];
    const proxima = ORDEM[indice + 1];
    const feita = item.situacao === "feito";

    return (
      <li
        // Arrastar só funciona com mouse; no celular os botões abaixo resolvem.
        draggable
        onDragStart={() => setArrastando(item.id)}
        onDragEnd={() => {
          setArrastando(null);
          setColunaAlvo(null);
        }}
        className={`group rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md ${
          arrastando === item.id ? "opacity-40" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={`min-w-0 flex-1 break-words text-sm font-medium ${
              feita ? "text-slate-400 line-through" : "text-slate-900"
            }`}
          >
            {item.titulo}
          </p>
          <div className="flex shrink-0 gap-0.5">
            <button
              onClick={() => abrirEditar(item)}
              aria-label={`Editar ${item.titulo}`}
              className="rounded-md p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button
              onClick={() => handleRemover(item)}
              aria-label={`Remover ${item.titulo}`}
              className="rounded-md p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ent.ponto}`} />
          <span className="truncate">{item.materia}</span>
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <BadgePrazo data={item.data} feita={feita} />
          <div className="flex shrink-0 gap-1">
            {anterior && (
              <button
                onClick={() => handleMover(item, anterior)}
                aria-label={`Mover ${item.titulo} para ${rotulos[anterior]}`}
                title={`Mover para ${rotulos[anterior]}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {proxima && (
              <button
                onClick={() => handleMover(item, proxima)}
                aria-label={`Mover ${item.titulo} para ${rotulos[proxima]}`}
                title={`Mover para ${rotulos[proxima]}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </li>
    );
  }

  function Coluna({ situacao }: { situacao: SituacaoTarefa }) {
    const daColuna = itens.filter((i) => i.situacao === situacao);
    const corDoPonto = CORES[situacao];

    return (
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setColunaAlvo(situacao);
        }}
        onDragLeave={() => setColunaAlvo((a) => (a === situacao ? null : a))}
        onDrop={() => {
          const item = itens.find((i) => i.id === arrastando);
          if (item) void handleMover(item, situacao);
          setArrastando(null);
          setColunaAlvo(null);
        }}
        // No celular cada coluna ocupa quase a tela e a rolagem trava nela
        // (scroll-snap); no desktop as três dividem a largura.
        //
        // A largura é em `vw`, e não em `%`: porcentagem é calculada sobre o
        // elemento pai, que dentro de um container flex pode inflar junto com o
        // conteúdo — a coluna dava 453px numa tela de 375.
        // O destaque de "solte aqui" é só um anel: mudar o fundo exigiria um
        // tom que o tema escuro não sobrescreve, e voltaria a clarear a coluna.
        className={`flex w-[85vw] shrink-0 snap-start flex-col rounded-2xl bg-slate-50 p-3 transition sm:w-auto sm:flex-1 ${
          colunaAlvo === situacao ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className={`h-2 w-2 rounded-full ${corDoPonto}`} />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            {rotulos[situacao]}
          </h2>
          <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium tabular-nums text-slate-500">
            {daColuna.length}
          </span>
        </div>

        {daColuna.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
            {situacao === "afazer"
              ? "Nada por aqui"
              : situacao === "fazendo"
                ? "Arraste algo para cá"
                : "Nada concluído ainda"}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {daColuna.map((i) => (
              <Cartao key={i.id} item={i} />
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    // `w-full` é obrigatório junto com `mx-auto`: margem automática no eixo
    // transversal desativa o stretch do flex pai, e sem largura declarada este
    // container passa a ter a largura do CONTEÚDO — as três colunas do quadro
    // esticavam a página inteira para o lado no celular.
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        titulo={config.titulo}
        subtitulo={config.subtitulo}
        acao={
          <Botao icone={ent.icone} onClick={abrirCriar}>
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
          acao={<Botao onClick={abrirCriar}>{config.rotuloNovo}</Botao>}
        />
      ) : (
        <>
          {/* -mx-4 no celular deixa as colunas encostarem na borda da tela,
              sinalizando que dá para deslizar. O scroll é do container: o
              body nunca rola de lado.
              `min-w-0` é obrigatório — sem ele o container não encolhe abaixo
              do conteúdo e empurra a página inteira para o lado. */}
          <div className="animate-in -mx-4 flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:snap-none sm:px-0">
            {ORDEM.map((s) => (
              <Coluna key={s} situacao={s} />
            ))}
          </div>
          <p className="mt-1 text-center text-[11px] text-slate-400 sm:hidden">
            Deslize para ver as outras etapas
          </p>
        </>
      )}

      <Modal
        aberto={aberto}
        onFechar={() => setAberto(false)}
        titulo={editando ? "Editar" : config.rotuloNovo}
      >
        {/* `key` em cada campo: sem isso o formulário mantém o valor do item
            anterior ao abrir a edição de outro. */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Título</label>
            <input
              name="titulo"
              required
              key={(editando?.id ?? "novo") + "-titulo"}
              defaultValue={editando?.titulo ?? ""}
              placeholder={config.placeholderTitulo}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Matéria</label>
            <select
              name="materia"
              required
              key={(editando?.id ?? "novo") + "-materia"}
              defaultValue={editando?.materia ?? ""}
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
              key={(editando?.id ?? "novo") + "-data"}
              defaultValue={editando?.data ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          )}
          <Botao type="submit" disabled={enviando || materias.length === 0}>
            {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar"}
          </Botao>
        </form>
      </Modal>
    </div>
  );
}
