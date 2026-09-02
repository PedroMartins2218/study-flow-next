import "server-only";

import { getAdminAuth } from "@/lib/firebase/admin";

export interface UsuarioAutenticado {
  uid: string;
  email: string | null;
  /**
   * O Firebase confirmou que este e-mail é mesmo da pessoa (ela clicou no
   * link enviado). Criar conta NÃO exige isso — qualquer um se cadastra com
   * qualquer endereço —, então nenhuma decisão que envolva dinheiro pode
   * confiar só no `email`.
   */
  emailVerificado: boolean;
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
    return {
      uid: decodificado.uid,
      email: decodificado.email ?? null,
      emailVerificado: decodificado.email_verified === true,
    };
  } catch (erro) {
    console.error("[auth] ID token inválido:", erro);
    return null;
  }
}
