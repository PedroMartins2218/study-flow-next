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
  trabalhoInputSchema,
  type TrabalhoInput,
} from "@/lib/validators/dominio";
import type { SituacaoTarefa, Trabalho } from "@/types/dominio";

function trabalhosRef(uid: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "trabalhos");
}

export function subscribeToTrabalhos(
  uid: string,
  onChange: (trabalhos: Trabalho[]) => void
): Unsubscribe {
  const q = query(trabalhosRef(uid), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        const concluido = Boolean(data.concluido);
        return {
          id: d.id,
          titulo: data.titulo,
          materia: data.materia,
          data: data.data,
          concluido,
          // Trabalhos criados antes do quadro não têm `situacao`: derivamos do
          // booleano para eles aparecerem na coluna certa sem migração.
          situacao: data.situacao ?? (concluido ? "feito" : "afazer"),
          criadoEm: data.criadoEm?.toDate?.().toISOString(),
        } satisfies Trabalho;
      })
    );
  });
}

export async function criarTrabalho(uid: string, input: TrabalhoInput) {
  const dados = trabalhoInputSchema.parse(input);
  await addDoc(trabalhosRef(uid), {
    ...dados,
    concluido: false,
    criadoEm: serverTimestamp(),
  });
}

export async function atualizarTrabalho(
  uid: string,
  id: string,
  input: TrabalhoInput
) {
  const dados = trabalhoInputSchema.parse(input);
  await updateDoc(doc(trabalhosRef(uid), id), dados);
}

export async function alternarTrabalho(
  uid: string,
  id: string,
  concluido: boolean
) {
  await updateDoc(doc(trabalhosRef(uid), id), {
    concluido,
    situacao: concluido ? "feito" : "afazer",
  });
}

/**
 * Move o trabalho de coluna no quadro.
 * Grava também `concluido` porque o dashboard e os gráficos contam pendências
 * pelo booleano — deixar os dois fora de sincronia faria o painel mentir.
 */
export async function moverTrabalho(
  uid: string,
  id: string,
  situacao: SituacaoTarefa
) {
  await updateDoc(doc(trabalhosRef(uid), id), {
    situacao,
    concluido: situacao === "feito",
  });
}

export async function removerTrabalho(uid: string, id: string) {
  await deleteDoc(doc(trabalhosRef(uid), id));
}
