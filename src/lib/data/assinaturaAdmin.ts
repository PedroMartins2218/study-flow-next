import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import type { Assinatura, StatusAssinatura, TierAssinatura } from "@/types/dominio";

export interface DadosAssinatura {
  status: StatusAssinatura;
  tier?: TierAssinatura;
  plano?: string;
  expiracao?: string; // formato YYYY-MM-DD
  vitalicio?: boolean;
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Remove chaves undefined: o Firestore rejeita `undefined` em set().
function semUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function lerAssinatura(uid: string): Promise<Assinatura | null> {
  const snap = await getAdminFirestore().collection("assinaturas").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() ?? {};
  return {
    status: data.status,
    tier: data.tier,
    plano: data.plano,
    expiracao: data.expiracao,
    vitalicio: data.vitalicio,
  };
}

export async function gravarAssinatura(uid: string, dados: DadosAssinatura): Promise<void> {
  await getAdminFirestore()
    .collection("assinaturas")
    .doc(uid)
    .set(
      { ...semUndefined({ ...dados }), atualizadoEm: FieldValue.serverTimestamp() },
      { merge: true }
    );
}

// A Cakto identifica o comprador pelo e-mail; o uid do Firebase só existe
// depois que a pessoa cria a conta. Retorna null (em vez de estourar) quando
// ainda não existe conta — quem chama decide gravar uma pendência.
export async function buscarUidPorEmail(email: string): Promise<string | null> {
  try {
    const usuario = await getAdminAuth().getUserByEmail(normalizarEmail(email));
    return usuario.uid;
  } catch {
    return null;
  }
}

/**
 * Guarda o acesso comprado por alguém que ainda não tem conta.
 * Sem isto, quem paga antes de se cadastrar simplesmente não recebe o acesso
 * (era o 404 do webhook antigo).
 */
export async function gravarPendente(email: string, dados: DadosAssinatura): Promise<void> {
  const emailKey = normalizarEmail(email);
  await getAdminFirestore()
    .collection("assinaturasPendentes")
    .doc(emailKey)
    .set(
      {
        ...semUndefined({ ...dados }),
        email: emailKey,
        atualizadoEm: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

/**
 * Promove uma compra pendente para a assinatura do usuário recém-criado.
 * Chamado no primeiro login/cadastro (rota /api/assinatura/sincronizar).
 * Retorna true se havia algo pendente para aplicar.
 */
export async function aplicarPendenteSeExistir(uid: string, email: string): Promise<boolean> {
  const db = getAdminFirestore();
  const emailKey = normalizarEmail(email);
  const ref = db.collection("assinaturasPendentes").doc(emailKey);
  const snap = await ref.get();
  if (!snap.exists) return false;

  const data = snap.data() ?? {};
  await gravarAssinatura(uid, {
    status: data.status ?? "ativo",
    tier: data.tier,
    plano: data.plano,
    expiracao: data.expiracao,
    // Sem isto, uma compra VITALÍCIA feita antes de a conta existir perderia
    // o "para sempre" justamente na hora de virar assinatura de verdade.
    vitalicio: data.vitalicio,
  });
  await ref.delete();
  return true;
}

/**
 * Existe compra aguardando este e-mail? Consulta sem aplicar nada.
 *
 * Serve para decidir se vale exigir e-mail confirmado: só faz sentido pedir a
 * confirmação quando há mesmo uma compra em jogo.
 */
export async function existePendente(email: string): Promise<boolean> {
  const snap = await getAdminFirestore()
    .collection("assinaturasPendentes")
    .doc(normalizarEmail(email))
    .get();
  return snap.exists;
}

/**
 * Usado pelo webhook: aplica a compra no uid quando a conta já existe, ou
 * guarda como pendente quando ainda não existe. Retorna o uid quando aplicou.
 */
export async function aplicarCompraPorEmail(
  email: string,
  dados: DadosAssinatura
): Promise<{ uid: string | null; pendente: boolean }> {
  const uid = await buscarUidPorEmail(email);
  if (!uid) {
    await gravarPendente(email, dados);
    return { uid: null, pendente: true };
  }
  await gravarAssinatura(uid, { ...dados, plano: dados.plano });
  return { uid, pendente: false };
}

// Mantido para o script manual `npm run assinatura` e correções pontuais.
export async function definirAssinaturaPorEmail(
  email: string,
  dados: DadosAssinatura
): Promise<string> {
  const usuario = await getAdminAuth().getUserByEmail(normalizarEmail(email));
  await gravarAssinatura(usuario.uid, dados);
  return usuario.uid;
}
