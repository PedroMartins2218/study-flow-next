"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { subscribeToSessoes } from "@/lib/data/sessoesFoco";
import { PageHeader } from "@/components/ui/PageHeader";
import { HeatmapFoco } from "@/components/ui/HeatmapFoco";
import { formatarDataCurta } from "@/lib/ui/datas";
import {
  calcularStreak,
  formatarMinutos,
  minutosPorDia,
  resumoFoco,
  ultimosDias,
} from "@/lib/ui/estatisticas";
import { useTemaEscuro } from "@/lib/ui/useTemaEscuro";
import type { Materia, SessaoFoco } from "@/types/studyflow";

function CardEstatistica({
  rotulo,
  valor,
  detalhe,
  tom,
}: {
  rotulo: string;
  valor: string;
  detalhe?: React.ReactNode;
  tom?: "positivo" | "negativo";
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{rotulo}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{valor}</p>
      {detalhe && (
        <p
          className={`mt-1 text-xs ${
            tom === "positivo"
              ? "font-medium text-emerald-600"
              : tom === "negativo"
                ? "font-medium text-amber-600"
                : "text-slate-500"
          }`}
        >
          {detalhe}
        </p>
      )}
    </div>
  );
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-sm font-semibold text-slate-900">{titulo}</h2>
      {descricao && <p className="mt-0.5 text-xs text-slate-500">{descricao}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function GraficosPage() {
  const { user } = useAuth();
  const [sessoes, setSessoes] = useState<SessaoFoco[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const escuro = useTemaEscuro();

  useEffect(() => {
    if (!user) return;
    const unsubS = subscribeToSessoes(user.uid, setSessoes);
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    return () => {
      unsubS();
      unsubM();
    };
  }, [user]);

  // Cores que o Recharts recebe por prop (CSS não alcança).
  const corGrade = escuro ? "#334155" : "#e2e8f0";
  const corTexto = escuro ? "#94a3b8" : "#64748b";
  const fundoTooltip = escuro ? "#0f172a" : "#ffffff";

  const resumo = useMemo(() => resumoFoco(sessoes), [sessoes]);
  const streak = useMemo(() => calcularStreak(sessoes), [sessoes]);

  const focoPorDia = useMemo(() => {
    const porDia = minutosPorDia(sessoes);
    return ultimosDias(14).map((dia) => ({
      dia: formatarDataCurta(dia),
      minutos: porDia.get(dia) ?? 0,
    }));
  }, [sessoes]);

  const focoPorMateria = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const s of sessoes) mapa.set(s.materia, (mapa.get(s.materia) ?? 0) + s.mins);
    return [...mapa.entries()]
      .map(([materia, minutos]) => ({ materia, minutos }))
      .sort((a, b) => b.minutos - a.minutos)
      .slice(0, 8);
  }, [sessoes]);

  const totalPorMateria = focoPorMateria.reduce((s, m) => s + m.minutos, 0);
  const semDados = sessoes.length === 0;

  const estiloTooltip = {
    contentStyle: {
      backgroundColor: fundoTooltip,
      border: `1px solid ${corGrade}`,
      borderRadius: 12,
      fontSize: 12,
      color: corTexto,
    },
    cursor: { fill: escuro ? "#1e293b" : "#f1f5f9" },
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        titulo="Gráficos"
        subtitulo="Sua evolução em números: constância, foco e progresso."
      />

      {/* Números principais */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CardEstatistica
          rotulo="Esta semana"
          valor={formatarMinutos(resumo.minutosSemana)}
          tom={
            resumo.variacaoSemanal === null
              ? undefined
              : resumo.variacaoSemanal >= 0
                ? "positivo"
                : "negativo"
          }
          detalhe={
            resumo.variacaoSemanal === null
              ? "primeira semana"
              : `${resumo.variacaoSemanal >= 0 ? "▲" : "▼"} ${Math.abs(
                  resumo.variacaoSemanal
                )}% vs. semana passada`
          }
        />
        <CardEstatistica
          rotulo="Sequência"
          valor={`${streak} ${streak === 1 ? "dia" : "dias"}`}
          detalhe={streak > 0 ? "seguidos de foco" : "comece hoje"}
          tom={streak >= 2 ? "positivo" : undefined}
        />
        <CardEstatistica
          rotulo="Média por dia"
          valor={formatarMinutos(resumo.mediaDiaria7)}
          detalhe="últimos 7 dias"
        />
        <CardEstatistica
          rotulo="Tempo total"
          valor={formatarMinutos(resumo.totalMinutos)}
          detalhe={`${sessoes.length} ${sessoes.length === 1 ? "sessão" : "sessões"}`}
        />
      </div>

      <Secao
        titulo="Constância"
        descricao="Cada quadrado é um dia. Quanto mais forte, mais tempo de foco."
      >
        <HeatmapFoco sessoes={sessoes} />
      </Secao>

      <Secao titulo="Foco por dia" descricao="Últimos 14 dias, em minutos.">
        {semDados ? (
          <p className="text-sm text-slate-400">
            Nenhuma sessão registrada ainda. Use o Modo foco para começar.
          </p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focoPorDia} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={corGrade} />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 11, fill: corTexto }}
                  axisLine={{ stroke: corGrade }}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: corTexto }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip formatter={(v) => [`${v} min`, "Foco"]} {...estiloTooltip} />
                <Bar dataKey="minutos" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={26}>
                  {focoPorDia.map((d, i) => (
                    // Destaca o dia de hoje (última barra).
                    <Cell key={i} fill={i === focoPorDia.length - 1 ? "#60a5fa" : "#2563eb"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Secao>

      <Secao titulo="Onde seu tempo foi" descricao="Minutos de foco por matéria.">
        {focoPorMateria.length === 0 ? (
          <p className="text-sm text-slate-400">
            Nenhuma sessão de foco registrada ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {focoPorMateria.map((m) => {
              const pct = totalPorMateria > 0 ? (m.minutos / totalPorMateria) * 100 : 0;
              return (
                <li key={m.materia}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate text-slate-700">{m.materia}</span>
                    <span className="shrink-0 text-slate-500">
                      {formatarMinutos(m.minutos)}
                      <span className="ml-1.5 text-xs text-slate-400">
                        {Math.round(pct)}%
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Secao>

      <Secao titulo="Progresso das matérias" descricao="O quanto você já avançou em cada uma.">
        {materias.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma matéria cadastrada.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {materias.map((m) => (
              <li key={m.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate text-slate-700">{m.nome}</span>
                  <span className="shrink-0 text-slate-500">{m.prog}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      m.prog >= 100 ? "bg-emerald-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.max(2, m.prog)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </div>
  );
}
