"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { subscribeToAtividades } from "@/lib/data/atividades";
import { subscribeToTrabalhos } from "@/lib/data/trabalhos";
import { subscribeToProvas } from "@/lib/data/provas";
import { subscribeToSessoes } from "@/lib/data/sessoesFoco";
import { Icone } from "@/components/ui/Icone";
import { Badge } from "@/components/ui/Badge";
import { ENTIDADES } from "@/lib/ui/entidades";
import type {
  Atividade,
  Materia,
  Prova,
  SessaoFoco,
  Trabalho,
} from "@/types/studyflow";

const DIAS_SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function CardMetrica({
  entidade,
  valor,
  sufixo,
  titulo,
  href,
}: {
  entidade: keyof typeof ENTIDADES;
  valor: string | number;
  sufixo?: string;
  titulo: string;
  href: string;
}) {
  const { chip, icone } = ENTIDADES[entidade];
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${chip}`}>
        <Icone nome={icone} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-3xl font-semibold text-slate-900">
        {valor}
        {sufixo && <span className="text-base font-normal text-slate-400">{sufixo}</span>}
      </p>
      <p className="mt-0.5 text-sm text-slate-500">{titulo}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [sessoes, setSessoes] = useState<SessaoFoco[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribeToMaterias(user.uid, setMaterias),
      subscribeToAtividades(user.uid, setAtividades),
      subscribeToTrabalhos(user.uid, setTrabalhos),
      subscribeToProvas(user.uid, setProvas),
      subscribeToSessoes(user.uid, setSessoes),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const hoje = new Date().toISOString().split("T")[0];
  const agora = new Date();

  const atividadesPendentes = atividades.filter((a) => !a.concluida);
  const trabalhosPendentes = trabalhos.filter((t) => !t.concluido);
  const proximaProva = [...provas]
    .filter((p) => p.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))[0];

  const focoHoje = sessoes
    .filter((s) => s.data === hoje)
    .reduce((soma, s) => soma + s.mins, 0);

  // Itens de "Hoje": pendentes com data <= hoje (hoje ou atrasados)
  const pendenciasHoje = useMemo(() => {
    type Item = { id: string; titulo: string; materia: string; data?: string; tipo: string };
    const itens: Item[] = [
      ...atividadesPendentes.map((a) => ({ ...a, tipo: "atividade" })),
      ...trabalhosPendentes.map((t) => ({ ...t, tipo: "trabalho" })),
    ];
    return itens
      .filter((i) => i.data && i.data <= hoje)
      .sort((a, b) => (a.data ?? "").localeCompare(b.data ?? ""))
      .slice(0, 5);
  }, [atividadesPendentes, trabalhosPendentes, hoje]);

  const focoSeteDias = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const s of sessoes) mapa.set(s.data, (mapa.get(s.data) ?? 0) + s.mins);
    const dias: { chave: string; mins: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const chave = d.toISOString().split("T")[0];
      dias.push({ chave, mins: mapa.get(chave) ?? 0 });
    }
    return dias;
  }, [sessoes]);
  const focoMax = Math.max(1, ...focoSeteDias.map((d) => d.mins));

  const diasAteProva = proximaProva
    ? Math.ceil((new Date(proximaProva.data + "T00:00:00").getTime() - new Date(hoje + "T00:00:00").getTime()) / 86400000)
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-900">
        {saudacao()}, {user?.displayName ?? user?.email?.split("@")[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {DIAS_SEMANA[agora.getDay()].charAt(0).toUpperCase() + DIAS_SEMANA[agora.getDay()].slice(1)},{" "}
        {agora.getDate()} de {MESES[agora.getMonth()]}
        {pendenciasHoje.length > 0
          ? ` · você tem ${pendenciasHoje.length} ${pendenciasHoje.length === 1 ? "tarefa" : "tarefas"} para hoje.`
          : " · nada pendente para hoje."}
      </p>

      {/* Métricas */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CardMetrica entidade="materias" valor={materias.length} titulo="Matérias" href="/materias" />
        <CardMetrica entidade="atividades" valor={atividadesPendentes.length} titulo="Atividades" href="/atividades" />
        <CardMetrica entidade="trabalhos" valor={trabalhosPendentes.length} titulo="Trabalhos" href="/trabalhos" />
        <CardMetrica entidade="foco" valor={focoHoje} sufixo="min" titulo="Foco hoje" href="/foco" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* Hoje */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <h2 className="text-sm font-semibold text-slate-900">Hoje</h2>
          {pendenciasHoje.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Nada pendente. Aproveite para adiantar os estudos!</p>
          ) : (
            <ul>
              {pendenciasHoje.map((i) => {
                const atrasado = (i.data ?? "") < hoje;
                const ent = i.tipo === "atividade" ? ENTIDADES.atividades : ENTIDADES.trabalhos;
                return (
                  <li
                    key={i.tipo + i.id}
                    className="flex items-center gap-3 border-t border-slate-100 py-2.5 first:border-t-0 first:pt-3"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${ent.ponto}`} />
                    <span className="flex-1 truncate text-sm text-slate-700">
                      {i.titulo}
                      {i.materia && <span className="text-slate-400"> · {i.materia}</span>}
                    </span>
                    <Badge tom={atrasado ? "perigo" : "alerta"}>{atrasado ? "Atrasado" : "Hoje"}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Coluna direita: foco + próxima prova */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <h2 className="text-sm font-semibold text-slate-900">Foco · últimos 7 dias</h2>
            <div className="mt-4 flex h-20 items-end gap-2">
              {focoSeteDias.map((d, idx) => (
                <div key={d.chave} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${idx === 6 ? "bg-blue-300" : "bg-blue-600"}`}
                    style={{ height: `${Math.max(4, (d.mins / focoMax) * 100)}%` }}
                    title={`${d.mins} min`}
                  />
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/provas"
            className="block rounded-2xl bg-blue-600 p-5 shadow-sm transition hover:bg-blue-700"
          >
            <p className="text-xs text-blue-100">
              {proximaProva ? `Próxima prova · ${proximaProva.materia}` : "Próxima prova"}
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {diasAteProva === null
                ? "Nenhuma agendada"
                : diasAteProva === 0
                  ? "É hoje!"
                  : `em ${diasAteProva} ${diasAteProva === 1 ? "dia" : "dias"}`}
            </p>
            {proximaProva && <p className="mt-0.5 text-xs text-blue-100">{proximaProva.titulo}</p>}
          </Link>
        </div>
      </div>
    </div>
  );
}
