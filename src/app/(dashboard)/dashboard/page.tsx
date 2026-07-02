"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToMaterias } from "@/lib/data/materias";
import { subscribeToAtividades } from "@/lib/data/atividades";
import { subscribeToTrabalhos } from "@/lib/data/trabalhos";
import { subscribeToProvas } from "@/lib/data/provas";
import type { Atividade, Materia, Prova, Trabalho } from "@/types/studyflow";

function CardResumo({
  titulo,
  valor,
  href,
}: {
  titulo: string;
  valor: string | number;
  href: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{titulo}</span>
        <Link href={href} className="text-xs text-slate-400 hover:underline">
          Ver todas
        </Link>
      </div>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{valor}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubM = subscribeToMaterias(user.uid, setMaterias);
    const unsubA = subscribeToAtividades(user.uid, setAtividades);
    const unsubT = subscribeToTrabalhos(user.uid, setTrabalhos);
    const unsubP = subscribeToProvas(user.uid, setProvas);
    return () => {
      unsubM();
      unsubA();
      unsubT();
      unsubP();
    };
  }, [user]);

  const hoje = new Date().toISOString().split("T")[0];
  const atividadesPendentes = atividades.filter((a) => !a.concluida);
  const trabalhosPendentes = trabalhos.filter((t) => !t.concluido);
  const proximaProva = provas.find((p) => p.data >= hoje);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900">
        Olá, {user?.displayName ?? user?.email}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Aqui está um resumo dos seus estudos.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CardResumo titulo="Matérias" valor={materias.length} href="/materias" />
        <CardResumo
          titulo="Atividades pendentes"
          valor={atividadesPendentes.length}
          href="/atividades"
        />
        <CardResumo
          titulo="Trabalhos pendentes"
          valor={trabalhosPendentes.length}
          href="/trabalhos"
        />
        <CardResumo
          titulo="Próxima prova"
          valor={proximaProva ? `${proximaProva.data}` : "—"}
          href="/provas"
        />
      </div>
    </div>
  );
}
