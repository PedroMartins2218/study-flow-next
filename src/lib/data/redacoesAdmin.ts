import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import type { FonteComparacao } from "@/lib/redacao/similaridade";
import { dataLocalISO, formatarDataCurta } from "@/lib/ui/datas";

/**
 * Redações anteriores do aluno, para o índice de reuso (auto-plágio).
 *
 * É lido no servidor de propósito: se o cliente enviasse a própria lista de
 * comparação, bastaria mandar uma lista vazia para o índice dar sempre 0.
 */
const LIMITE_PADRAO = 20;

export async function lerTextosAnteriores(
  uid: string,
  limite = LIMITE_PADRAO
): Promise<FonteComparacao[]> {
  const snap = await getAdminFirestore()
    .collection("usuarios")
    .doc(uid)
    .collection("redacoes")
    .orderBy("criadoEm", "desc")
    .limit(limite)
    .get();

  return snap.docs.flatMap((d) => {
    const dados = d.data();
    const texto = typeof dados.texto === "string" ? dados.texto : "";
    if (!texto.trim()) return [];

    const data = dados.criadoEm?.toDate?.();
    const rotulo = data
      ? `Sua redação de ${formatarDataCurta(dataLocalISO(data))}`
      : "Redação sua anterior";

    return [{ rotulo, conteudo: texto }];
  });
}
