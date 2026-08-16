"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  atualizarMateria,
  criarMateria,
  definirCapaMateria,
  removerMateria,
  subscribeToMaterias,
} from "@/lib/data/materias";
import { comprimirImagem, IMAGEM_CAPA } from "@/lib/ui/imagem";
import { PageHeader } from "@/components/ui/PageHeader";
import { Botao } from "@/components/ui/Botao";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icone } from "@/components/ui/Icone";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { ENTIDADES } from "@/lib/ui/entidades";
import type { Materia } from "@/types/studyflow";

const PASSO_PROGRESSO = 5;

// Gradiente estável derivado do nome: sem capa, a lista já nasce colorida e
// cada matéria mantém sempre a mesma cor, sem custo de armazenamento.
const GRADIENTES = [
  "from-blue-500 to-sky-400",
  "from-violet-500 to-purple-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-cyan-500 to-blue-400",
];

function gradienteDoNome(nome: string): string {
  let soma = 0;
  for (let i = 0; i < nome.length; i++) soma += nome.charCodeAt(i);
  return GRADIENTES[soma % GRADIENTES.length];
}

export default function MateriasPage() {
  const { user } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const [materias, setMaterias] = useState<Materia[]>([]);
  // Progresso mostrado na tela enquanto a gravação não sai. Sem isso, a barra
  // só andaria quando o Firestore respondesse, e os cliques pareceriam perdidos.
  const [progressoLocal, setProgressoLocal] = useState<Record<string, number>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviandoCapa, setEnviandoCapa] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToMaterias(user.uid, (m) => {
      setMaterias(m);
      setCarregando(false);
    });
  }, [user]);

  // Limpa os timers pendentes se a tela for desmontada no meio de uma rajada.
  useEffect(() => {
    const pendentes = timers.current;
    return () => Object.values(pendentes).forEach(clearTimeout);
  }, []);

  /**
   * Ajusta o progresso pelos botões + / −.
   * A barra anda na hora e a gravação é adiada: dez cliques seguidos viram
   * uma escrita só no Firestore, em vez de dez.
   */
  const ajustarProgresso = useCallback(
    (materia: Materia, delta: number) => {
      if (!user) return;
      const atual = progressoLocal[materia.id] ?? materia.prog;
      const novo = Math.min(100, Math.max(0, atual + delta));
      if (novo === atual) return;

      setProgressoLocal((p) => ({ ...p, [materia.id]: novo }));

      clearTimeout(timers.current[materia.id]);
      timers.current[materia.id] = setTimeout(async () => {
        try {
          await atualizarMateria(user.uid, materia.id, { nome: materia.nome, prog: novo });
        } catch {
          // Falhou: devolve o valor do servidor para a tela não mentir.
          setProgressoLocal((p) => {
            const copia = { ...p };
            delete copia[materia.id];
            return copia;
          });
          toast("Não foi possível salvar o progresso", "erro");
        }
      }, 600);
    },
    [user, progressoLocal, toast]
  );

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
        toast("Matéria atualizada");
      } else {
        await criarMateria(user.uid, dados);
        toast("Matéria adicionada");
      }
      setAberto(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar matéria.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleCapa(m: Materia, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reenviar o mesmo arquivo depois
    if (!file || !user) return;
    setEnviandoCapa(m.id);
    try {
      const dataUrl = await comprimirImagem(file, IMAGEM_CAPA);
      await definirCapaMateria(user.uid, m.id, dataUrl);
      toast("Capa atualizada");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Não foi possível usar essa imagem", "erro");
    } finally {
      setEnviandoCapa(null);
    }
  }

  async function handleRemoverCapa(m: Materia) {
    if (!user) return;
    await definirCapaMateria(user.uid, m.id, null);
    toast("Capa removida");
  }

  async function handleRemover(m: Materia) {
    if (!user) return;
    const ok = await confirmar({
      titulo: `Remover “${m.nome}”?`,
      descricao: "Isso apaga a matéria e não pode ser desfeito.",
      confirmar: "Remover",
      perigo: true,
    });
    if (!ok) return;
    await removerMateria(user.uid, m.id);
    toast("Matéria removida");
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

      {carregando ? (
        <CardsSkeleton />
      ) : materias.length === 0 ? (
        <EmptyState
          titulo="Nenhuma matéria ainda"
          descricao="Comece cadastrando a primeira matéria que você está estudando."
          acao={<Botao onClick={abrirCriar}>Adicionar matéria</Botao>}
        />
      ) : (
        <ul className="animate-in grid grid-cols-1 gap-3 sm:grid-cols-2">
          {materias.map((m) => (
            <li
              key={m.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Capa: imagem enviada ou gradiente derivado do nome */}
              <div className="relative h-24 w-full overflow-hidden">
                {m.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.capa} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${gradienteDoNome(m.nome)}`} />
                )}

                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 p-2 opacity-0 transition group-hover:opacity-100">
                  <label
                    className={`cursor-pointer rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white ${
                      enviandoCapa === m.id ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {enviandoCapa === m.id ? "Enviando..." : m.capa ? "Trocar capa" : "Adicionar capa"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleCapa(m, e)}
                    />
                  </label>
                  {m.capa && (
                    <button
                      onClick={() => handleRemoverCapa(m)}
                      className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-red-600 shadow-sm backdrop-blur transition hover:bg-white"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5">
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
                    onClick={() => handleRemover(m)}
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
              {(() => {
                const prog = progressoLocal[m.id] ?? m.prog;
                return (
                  <>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <button
                        onClick={() => ajustarProgresso(m, -PASSO_PROGRESSO)}
                        disabled={prog === 0}
                        aria-label={`Diminuir progresso de ${m.nome}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
                          <path strokeLinecap="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="text-sm font-semibold tabular-nums text-slate-700">
                        {prog}%
                      </span>
                      <button
                        onClick={() => ajustarProgresso(m, PASSO_PROGRESSO)}
                        disabled={prog === 100}
                        aria-label={`Aumentar progresso de ${m.nome}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
                          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </>
                );
              })()}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
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
      </Modal>
    </div>
  );
}
