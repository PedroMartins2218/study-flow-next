import "server-only";

import { getAdminAuth } from "@/lib/firebase/admin";

export interface UsuarioAutenticado {
  uid: string;
  email: string | null;
}

/**
 * Confirma a identidade de quem chamou a rota pelo ID token do Firebase
 * (Authorization: Bearer <token>). O cliente pode mentir sobre qualquer coisa,
 * menos sobre um token assinado — por isso toda rota que libera acesso pago ou
 * gasta API passa por aqui.
 */
export async function autenticarRequisicao(
  request: Request
): Promise<UsuarioAutenticado | null> {
  const cabecalho = request.headers.get("authorization") ?? "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7).trim() : "";
  if (!token) return null;

  try {
    const decodificado = await getAdminAuth().verifyIdToken(token);
    return { uid: decodificado.uid, email: decodificado.email ?? null };
  } catch (erro) {
    console.error("[auth] ID token inválido:", erro);
    return null;
  }
}
