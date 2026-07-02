import "server-only";

import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import type { StatusAssinatura } from "@/types/studyflow";

export interface DadosAssinatura {
  status: StatusAssinatura;
  plano?: string;
  expiracao?: string; // formato YYYY-MM-DD
}

// Usado pela rota de webhook (server-side). Kirvano identifica o comprador
// pelo e-mail; aqui resolvemos o uid correspondente no Firebase Auth antes
// de escrever, porque o cliente nunca decide/escreve a própria assinatura.
export async function definirAssinaturaPorEmail(
  email: string,
  dados: DadosAssinatura
): Promise<string> {
  const usuario = await getAdminAuth().getUserByEmail(email);
  await getAdminFirestore()
    .collection("assinaturas")
    .doc(usuario.uid)
    .set(dados, { merge: true });
  return usuario.uid;
}
