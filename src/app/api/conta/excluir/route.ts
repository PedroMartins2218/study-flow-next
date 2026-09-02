import { NextResponse } from "next/server";
import { autenticarRequisicao } from "@/lib/auth/autenticarRequisicao";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

/**
 * Exclusão de conta e de todos os dados do usuário.
 *
 * A LGPD dá à pessoa o direito de eliminar os dados dela, e o público do Nexo
 * Study inclui menores de idade — o que eleva o patamar de exigência. Por isso
 * isto apaga de verdade, não marca como "inativo".
 *
 * Ordem importa: primeiro os dados, depois a conta de login. Se fosse ao
 * contrário e algo falhasse no meio, sobrariam dados órfãos que ninguém mais
 * consegue alcançar nem apagar (o dono do documento é o uid, que deixaria de
 * existir).
 */
export async function POST(request: Request) {
  const usuario = await autenticarRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const db = getAdminFirestore();
  const uid = usuario.uid;

  try {
    // recursiveDelete varre subcoleções em qualquer profundidade — o Firestore
    // não apaga em cascata sozinho, e aqui há dois níveis
    // (anotacoes/{id}/anexos e conversas/{id}/mensagens).
    await db.recursiveDelete(db.collection("usuarios").doc(uid));

    // Assinatura e cota de IA vivem fora de usuarios/{uid}.
    await db.collection("assinaturas").doc(uid).delete();
    await db.collection("usoIa").doc(uid).delete();

    // A pendência de compra é chaveada por e-mail, não por uid.
    if (usuario.email) {
      await db
        .collection("assinaturasPendentes")
        .doc(usuario.email.trim().toLowerCase())
        .delete()
        .catch(() => {});
    }

    // Por último a conta de login. Depois disto o token atual não vale mais.
    await getAdminAuth().deleteUser(uid);

    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("[conta/excluir] falha ao excluir:", erro);
    return NextResponse.json(
      { erro: "não foi possível excluir sua conta agora. Tente de novo em alguns minutos." },
      { status: 500 }
    );
  }
}

/**
 * O ledger de `pagamentos` NÃO é apagado de propósito: é registro fiscal e
 * contábil de transações, que a legislação manda guardar e cuja base legal é
 * "cumprimento de obrigação legal", não consentimento. Ele guarda e-mail e
 * valor, não os dados de estudo. Se um dia for preciso, o caminho é
 * anonimizar o e-mail nesses documentos, não excluí-los.
 */
