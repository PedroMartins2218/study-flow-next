import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { ReservaInput } from "@/lib/validators/studyflow";

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
