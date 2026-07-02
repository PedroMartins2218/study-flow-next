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
} from "@/lib/validators/studyflow";
import type { Trabalho } from "@/types/studyflow";

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
        return {
          id: d.id,
          titulo: data.titulo,
          materia: data.materia,
          data: data.data,
          concluido: Boolean(data.concluido),
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

export async function alternarTrabalho(
  uid: string,
  id: string,
  concluido: boolean
) {
  await updateDoc(doc(trabalhosRef(uid), id), { concluido });
}

export async function removerTrabalho(uid: string, id: string) {
  await deleteDoc(doc(trabalhosRef(uid), id));
}
