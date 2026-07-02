"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { subscribeToSessoes } from "@/lib/data/sessoesFoco";
import type { Materia, SessaoFoco } from "@/types/studyflow";

function ultimosSeteDias(): string[] {
  const dias: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push(d.toISOString().split("T")[0]);
  }
  return dias;
}

function rotuloDia(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

export default function GraficosPage() {
  const { user } = useAuth();
  const [sessoes, setSessoes] = useState<SessaoFoco[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubS = subscribeToSessoes(user.uid, setSessoes);
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    return () => {
      unsubS();
      unsubM();
    };
  }, [user]);

  const focoPorDia = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const s of sessoes) {
      mapa.set(s.data, (mapa.get(s.data) ?? 0) + s.mins);
    }
    return ultimosSeteDias().map((dia) => ({
      dia: rotuloDia(dia),
      minutos: mapa.get(dia) ?? 0,
    }));
  }, [sessoes]);

  const focoPorMateria = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const s of sessoes) {
      mapa.set(s.materia, (mapa.get(s.materia) ?? 0) + s.mins);
    }
    return [...mapa.entries()]
      .map(([materia, minutos]) => ({ materia, minutos }))
      .sort((a, b) => b.minutos - a.minutos)
      .slice(0, 8);
  }, [sessoes]);

  const totalMinutos = sessoes.reduce((soma, s) => soma + s.mins, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900">Gráficos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sua evolução em números: foco, matérias e progresso.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-500">Tempo total de foco</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {Math.floor(totalMinutos / 60)}h {totalMinutos % 60}min
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-500">Sessões de foco</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{sessoes.length}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">
          Minutos de foco por dia (últimos 7 dias)
        </h2>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={focoPorDia}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} width={32} />
              <Tooltip formatter={(v) => [`${v} min`, "Foco"]} />
              <Bar dataKey="minutos" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Minutos de foco por matéria</h2>
        {focoPorMateria.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Nenhuma sessão de foco registrada ainda. Use o Modo foco para começar.
          </p>
        ) : (
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focoPorMateria} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis
                  type="category"
                  dataKey="materia"
                  width={110}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip formatter={(v) => [`${v} min`, "Foco"]} />
                <Bar dataKey="minutos" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Progresso das matérias</h2>
        {materias.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Nenhuma matéria cadastrada.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {materias.map((m) => (
              <li key={m.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{m.nome}</span>
                  <span className="text-slate-500">{m.prog}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: `${m.prog}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
