import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  anotacaoInputSchema,
  type AnotacaoInput,
} from "@/lib/validators/studyflow";
import type { Anotacao } from "@/types/studyflow";

function anotacoesRef(uid: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "anotacoes");
}

export function subscribeToAnotacoes(
  uid: string,
  onChange: (anotacoes: Anotacao[]) => void
): Unsubscribe {
  const q = query(anotacoesRef(uid), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          titulo: data.titulo,
          materia: data.materia || undefined,
          conteudo: data.conteudo,
          criadoEm: data.criadoEm?.toDate?.().toISOString(),
          atualizadoEm: data.atualizadoEm?.toDate?.().toISOString(),
        } satisfies Anotacao;
      })
    );
  });
}

export async function criarAnotacao(uid: string, input: AnotacaoInput) {
  const dados = anotacaoInputSchema.parse(input);
  await addDoc(anotacoesRef(uid), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

export async function atualizarAnotacao(
  uid: string,
  id: string,
  input: AnotacaoInput
) {
  const dados = anotacaoInputSchema.parse(input);
  await updateDoc(doc(anotacoesRef(uid), id), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

export async function removerAnotacao(uid: string, id: string) {
  await deleteDoc(doc(anotacoesRef(uid), id));
}
