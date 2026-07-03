"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { criarProva, removerProva, subscribeToProvas } from "@/lib/data/provas";
import { subscribeToMaterias } from "@/lib/data/materias";
import { PageHeader } from "@/components/ui/PageHeader";
import { Botao } from "@/components/ui/Botao";
import { SlideOver } from "@/components/ui/SlideOver";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Icone } from "@/components/ui/Icone";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { ENTIDADES } from "@/lib/ui/entidades";
import { diasAte, formatarDataCurta, hojeISO } from "@/lib/ui/datas";
import type { Materia, Prova } from "@/types/studyflow";

const TIPOS = ["Prova", "Simulado"];

function BadgeProva({ data }: { data: string }) {
  const dias = diasAte(data);
  if (dias < 0) return <Badge tom="neutro">Encerrada</Badge>;
  if (dias === 0) return <Badge tom="perigo">É hoje!</Badge>;
  if (dias <= 7) return <Badge tom="alerta">em {dias} {dias === 1 ? "dia" : "dias"}</Badge>;
  return <Badge tom="info">em {dias} dias</Badge>;
}

export default function ProvasPage() {
  const { user } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const [provas, setProvas] = useState<Prova[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubP = subscribeToProvas(user.uid, (lista) => {
      setProvas(lista);
      setCarregando(false);
    });
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    return () => {
      unsubP();
      unsubM();
    };
  }, [user]);

  async function handleRemover(prova: Prova) {
    if (!user) return;
    const ok = await confirmar({
      titulo: `Remover “${prova.titulo}”?`,
      descricao: "Esta ação não pode ser desfeita.",
      confirmar: "Remover",
      perigo: true,
    });
    if (!ok) return;
    await removerProva(user.uid, prova.id);
    toast("Prova removida");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    try {
      await criarProva(user.uid, {
        titulo: String(form.get("titulo") ?? ""),
        tipo: String(form.get("tipo") ?? ""),
        materia: String(form.get("materia") ?? ""),
        data: String(form.get("data") ?? ""),
      });
      toast("Prova agendada");
      setAberto(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar prova.");
    } finally {
      setEnviando(false);
    }
  }

  const hoje = hojeISO();
  const futuras = provas
    .filter((p) => p.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data));
  const passadas = provas
    .filter((p) => p.data < hoje)
    .sort((a, b) => b.data.localeCompare(a.data));

  function Cartao({ prova }: { prova: Prova }) {
    return (
      <li className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${ENTIDADES.provas.chip}`}
        >
          <Icone nome="calendario" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{prova.titulo}</p>
          <p className="text-xs text-slate-500">
            {prova.tipo} · {prova.materia} · {formatarDataCurta(prova.data)}
          </p>
        </div>
        <BadgeProva data={prova.data} />
        <button
          onClick={() => handleRemover(prova)}
          aria-label={`Remover ${prova.titulo}`}
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
        titulo="Provas e simulados"
        subtitulo="Datas que você precisa ter na cabeça."
        acao={
          <Botao icone="calendario" onClick={() => { setErro(""); setAberto(true); }}>
            Nova prova
          </Botao>
        }
      />

      {carregando ? (
        <CardsSkeleton />
      ) : provas.length === 0 ? (
        <EmptyState
          titulo="Nenhuma prova agendada"
          descricao="Cadastre provas e simulados para acompanhar a contagem regressiva."
          acao={<Botao onClick={() => setAberto(true)}>Agendar prova</Botao>}
        />
      ) : (
        <>
          <ul className="animate-in space-y-2">
            {futuras.map((p) => (
              <Cartao key={p.id} prova={p} />
            ))}
            {futuras.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400">
                Nenhuma prova à vista. Respira!
              </li>
            )}
          </ul>
          {passadas.length > 0 && (
            <>
              <h2 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Encerradas ({passadas.length})
              </h2>
              <ul className="space-y-2">
                {passadas.map((p) => (
                  <Cartao key={p.id} prova={p} />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <SlideOver aberto={aberto} onFechar={() => setAberto(false)} titulo="Nova prova">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Título</label>
            <input
              name="titulo"
              required
              placeholder="Ex.: Prova bimestral"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Tipo</label>
            <select
              name="tipo"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
            <label className="mb-1 block text-xs font-medium text-slate-500">Data</label>
            <input
              name="data"
              type="date"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
          )}
          <Botao type="submit" disabled={enviando || materias.length === 0}>
            {enviando ? "Salvando..." : "Agendar prova"}
          </Botao>
        </form>
      </SlideOver>
    </div>
  );
}
