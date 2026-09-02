import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Reserva } from "@/types/dominio";

// A coleção `reservas` guarda os leads captados antes do lançamento.
// A rota pública de escrita foi removida em 01/09/2026: a landing não tinha
// mais formulário de reserva, e um endpoint público que grava no banco sem
// autenticação nem limite de frequência é superfície de ataque de graça.
// A coleção continua sendo LIDA aqui (painel /admin) e pela elegibilidade do
// trial em trialAdmin.ts.

// Lista todas as reservas (leads) para o painel de admin. Server-only.
export async function listarReservas(): Promise<Reserva[]> {
  const snap = await getAdminFirestore()
    .collection("reservas")
    .orderBy("criadoEm", "desc")
    .get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      nome: data.nome ?? "",
      email: data.email ?? d.id,
      plano: data.plano ?? undefined,
      objetivo: data.objetivo ?? undefined,
      criadoEm: data.criadoEm?.toDate?.().toISOString(),
    } satisfies Reserva;
  });
}
