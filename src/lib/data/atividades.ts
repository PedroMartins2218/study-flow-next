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
  atividadeInputSchema,
  type AtividadeInput,
} from "@/lib/validators/studyflow";
import type { Atividade } from "@/types/studyflow";

function atividadesRef(uid: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "atividades");
}

export function subscribeToAtividades(
  uid: string,
  onChange: (atividades: Atividade[]) => void
): Unsubscribe {
  const q = query(atividadesRef(uid), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          titulo: data.titulo,
          materia: data.materia,
          data: data.data,
          concluida: Boolean(data.concluida),
          criadoEm: data.criadoEm?.toDate?.().toISOString(),
        } satisfies Atividade;
      })
    );
  });
}

export async function criarAtividade(uid: string, input: AtividadeInput) {
  const dados = atividadeInputSchema.parse(input);
  await addDoc(atividadesRef(uid), {
    ...dados,
    concluida: false,
    criadoEm: serverTimestamp(),
  });
}

export async function alternarAtividade(
  uid: string,
  id: string,
  concluida: boolean
) {
  await updateDoc(doc(atividadesRef(uid), id), { concluida });
}

export async function removerAtividade(uid: string, id: string) {
  await deleteDoc(doc(atividadesRef(uid), id));
}
