import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { hojeISO } from "@/lib/data/assinaturaCore";

/**
 * Cota mensal de uso do Agente de IA — é o que impede a conta da API de
 * ultrapassar a margem do plano Pro.
 *
 * Duas decisões importantes:
 *  1. A reserva acontece ANTES de chamar o modelo (e é estornada se a chamada
 *     falhar). Contar depois abriria janela para uso simultâneo furar o teto.
 *  2. Tudo dentro de uma transação: dois pedidos ao mesmo tempo não podem ler
 *     o mesmo contador e gravar o mesmo valor.
 */

export const LIMITE_PADRAO_PRO = Number(process.env.IA_LIMITE_PRO ?? 100);

function cicloAtual(): string {
  return hojeISO().slice(0, 7); // YYYY-MM em Brasília
}

export interface StatusCota {
  usadas: number;
  limite: number;
  restantes: number;
}

export type ResultadoReserva =
  | { ok: true; restantes: number }
  | { ok: false; limite: number };

export async function reservarCota(
  uid: string,
  limite = LIMITE_PADRAO_PRO
): Promise<ResultadoReserva> {
  const db = getAdminFirestore();
  const ref = db.collection("usoIa").doc(uid);
  const ciclo = cicloAtual();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const dados = snap.exists ? (snap.data() ?? {}) : {};

    // Virou o mês? O contador zera junto com o ciclo de cobrança.
    const usadas = dados.cicloRef === ciclo ? Number(dados.usadasNoCiclo ?? 0) : 0;

    if (usadas >= limite) {
      return { ok: false as const, limite };
    }

    tx.set(
      ref,
      {
        cicloRef: ciclo,
        limiteMensal: limite,
        usadasNoCiclo: usadas + 1,
        atualizadoEm: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { ok: true as const, restantes: limite - (usadas + 1) };
  });
}

/**
 * Devolve a cota quando a chamada ao modelo falhou — o usuário não pode pagar
 * por um erro nosso ou da API.
 */
export async function estornarCota(uid: string): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection("usoIa").doc(uid);
  const ciclo = cicloAtual();

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const dados = snap.data() ?? {};
      // Só estorna dentro do mesmo ciclo; se já virou o mês, não há o que devolver.
      if (dados.cicloRef !== ciclo) return;
      const usadas = Number(dados.usadasNoCiclo ?? 0);
      if (usadas <= 0) return;
      tx.update(ref, { usadasNoCiclo: usadas - 1 });
    });
  } catch (erro) {
    // Estorno é melhor-esforço: falhar aqui não pode derrubar a resposta.
    console.error("[usoIa] falha ao estornar cota:", erro);
  }
}

export async function lerCota(uid: string, limite = LIMITE_PADRAO_PRO): Promise<StatusCota> {
  const snap = await getAdminFirestore().collection("usoIa").doc(uid).get();
  const dados = snap.exists ? (snap.data() ?? {}) : {};
  const usadas = dados.cicloRef === cicloAtual() ? Number(dados.usadasNoCiclo ?? 0) : 0;
  const limiteEfetivo = Number(dados.limiteMensal ?? limite);
  return {
    usadas,
    limite: limiteEfetivo,
    restantes: Math.max(0, limiteEfetivo - usadas),
  };
}
