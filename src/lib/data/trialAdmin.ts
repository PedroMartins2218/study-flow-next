import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { DIAS_TRIAL, jaLancou } from "@/lib/launch";

export type ResultadoTrial =
  | { ok: true }
  | { ok: false; motivo: string; status: number };

// Ativa o teste grátis de 7 dias para quem reservou (e só para quem reservou).
// Regras:
//  - só após o lançamento;
//  - o e-mail precisa estar na lista de reservas;
//  - não regrava se já existir uma assinatura (evita resetar trial expirado).
export async function ativarTrialSeElegivel(
  uid: string,
  email: string
): Promise<ResultadoTrial> {
  if (!jaLancou()) {
    return {
      ok: false,
      motivo: "O Study Flow ainda não abriu. Volte no dia do lançamento!",
      status: 403,
    };
  }

  const db = getAdminFirestore();

  // Já tem assinatura? Não faz nada (ativa segue ativa; expirada precisa pagar).
  const assinaturaSnap = await db.collection("assinaturas").doc(uid).get();
  if (assinaturaSnap.exists) {
    return { ok: true };
  }

  // Reservou?
  const emailKey = email.trim().toLowerCase();
  const reservaSnap = await db.collection("reservas").doc(emailKey).get();
  if (!reservaSnap.exists) {
    return {
      ok: false,
      motivo:
        "Seu e-mail não está na lista de reservas de fundador. O teste grátis é exclusivo para quem reservou.",
      status: 403,
    };
  }

  // Concede 7 dias de trial.
  const exp = new Date();
  exp.setDate(exp.getDate() + DIAS_TRIAL);
  const expiracao = exp.toISOString().split("T")[0];

  await db.collection("assinaturas").doc(uid).set({
    status: "trial",
    plano: "trial",
    expiracao,
    fonte: "trial-reserva",
    email: emailKey,
    atualizadoEm: FieldValue.serverTimestamp(),
  });

  return { ok: true };
}
