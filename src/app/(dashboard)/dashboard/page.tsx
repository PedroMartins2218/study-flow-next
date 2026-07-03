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

// Sequência de dias seguidos com pelo menos uma sessão de foco (contando a
// partir de hoje ou, se hoje ainda não teve, de ontem).
function calcularStreak(sessoes: SessaoFoco[]): number {
  const dias = new Set(sessoes.map((s) => s.data));
  const iso = (d: Date) => d.toISOString().split("T")[0];
  const cursor = new Date();
  if (!dias.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dias.has(iso(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
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
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribeToMaterias(user.uid, (m) => {
        setMaterias(m);
        setCarregando(false);
      }),
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

  const streak = calcularStreak(sessoes);

  const passosOnboarding = [
    { feito: materias.length > 0, label: "Cadastrar sua 1ª matéria", href: "/materias" },
    { feito: atividades.length > 0, label: "Adicionar uma atividade", href: "/atividades" },
    { feito: sessoes.length > 0, label: "Fazer sua 1ª sessão de foco", href: "/foco" },
  ];
  const concluidosOnboarding = passosOnboarding.filter((p) => p.feito).length;
  const mostrarOnboarding = !carregando && concluidosOnboarding < passosOnboarding.length;

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

      {/* Onboarding do primeiro acesso */}
      {mostrarOnboarding && (
        <div className="animate-in mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Primeiros passos</h2>
            <span className="text-xs text-slate-500">
              {concluidosOnboarding} de {passosOnboarding.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-blue-600 transition-all"
              style={{ width: `${(concluidosOnboarding / passosOnboarding.length) * 100}%` }}
            />
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {passosOnboarding.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                    p.feito
                      ? "border-slate-100 bg-slate-50"
                      : "border-blue-100 hover:bg-blue-50/60"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      p.feito ? "bg-emerald-500 text-white" : "border-2 border-blue-500"
                    }`}
                  >
                    {p.feito && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`flex-1 text-sm ${
                      p.feito ? "text-slate-400 line-through" : "font-medium text-slate-900"
                    }`}
                  >
                    {p.label}
                  </span>
                  {!p.feito && <Icone nome="arquivo" className="hidden h-4 w-4 text-blue-500" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sequência de foco */}
      {streak >= 2 && (
        <div className="animate-in mt-6 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2c.5 3-1.5 4.5-2.8 6C7.7 9.7 7 11.3 7 13a5 5 0 0010 0c0-2-1-3.8-2.2-5C13.2 6.4 12.8 4 12 2zm0 16a2.5 2.5 0 01-2.5-2.5c0-1 .5-1.8 1.2-2.6.4.7 1 1.1 1.8 1.3.9-.3 1-1 1-1.5.6.7 1 1.6 1 2.8A2.5 2.5 0 0112 18z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-blue-900">{streak} dias seguidos de foco</p>
            <p className="text-xs text-blue-700/80">Mantenha a chama acesa — não quebra hoje!</p>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="animate-in mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
