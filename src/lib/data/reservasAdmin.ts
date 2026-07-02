import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { ReservaInput } from "@/lib/validators/studyflow";
import type { Reserva } from "@/types/studyflow";

// Grava um lead de reserva (pré-lançamento) na coleção `reservas`.
// Escrita só acontece aqui, no servidor, via Admin SDK — a coleção fica
// fechada para o cliente pelas regras do Firestore. Usa o e-mail como ID do
// documento para deduplicar (mesma pessoa reservando de novo só atualiza).
export async function registrarReserva(dados: ReservaInput): Promise<void> {
  const id = dados.email.toLowerCase();
  await getAdminFirestore()
    .collection("reservas")
    .doc(id)
    .set(
      {
        nome: dados.nome,
        email: id,
        plano: dados.plano || null,
        objetivo: dados.objetivo || null,
        atualizadoEm: FieldValue.serverTimestamp(),
        criadoEm: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

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
