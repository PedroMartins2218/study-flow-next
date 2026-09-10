import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { redacaoInputSchema, type RedacaoInput } from "@/lib/validators/dominio";
import type { Redacao } from "@/types/dominio";

// Redação corrigida. Como nas outras entidades, a gravação sai do cliente e é
// protegida pelas regras do Firestore — a rota de IA só devolve a correção.
//
// A subcoleção nova já é coberta por `match /usuarios/{docId}/{documento=**}`
// em firestore.rules; não há regra a acrescentar.

function redacoesRef(uid: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "redacoes");
}

export function subscribeToRedacoes(
  uid: string,
  onChange: (redacoes: Redacao[]) => void
): Unsubscribe {
  const q = query(redacoesRef(uid), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          tema: data.tema,
          texto: data.texto,
          textoMotivador: data.textoMotivador,
          correcao: data.correcao,
          plagio: data.plagio,
          proveniencia: data.proveniencia,
          criadoEm: data.criadoEm?.toDate?.().toISOString(),
        } satisfies Redacao;
      })
    );
  });
}

export async function criarRedacao(uid: string, input: RedacaoInput): Promise<string> {
  const dados = redacaoInputSchema.parse(input);
  const ref = await addDoc(redacoesRef(uid), { ...dados, criadoEm: serverTimestamp() });
  return ref.id;
}

export async function removerRedacao(uid: string, id: string) {
  await deleteDoc(doc(redacoesRef(uid), id));
}
