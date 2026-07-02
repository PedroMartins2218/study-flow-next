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
import { provaInputSchema, type ProvaInput } from "@/lib/validators/studyflow";
import type { Prova } from "@/types/studyflow";

function provasRef(uid: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "provas");
}

export function subscribeToProvas(
  uid: string,
  onChange: (provas: Prova[]) => void
): Unsubscribe {
  const q = query(provasRef(uid), orderBy("data", "asc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          titulo: data.titulo,
          tipo: data.tipo,
          materia: data.materia,
          data: data.data,
          criadoEm: data.criadoEm?.toDate?.().toISOString(),
        } satisfies Prova;
      })
    );
  });
}

export async function criarProva(uid: string, input: ProvaInput) {
  const dados = provaInputSchema.parse(input);
  await addDoc(provasRef(uid), { ...dados, criadoEm: serverTimestamp() });
}

export async function removerProva(uid: string, id: string) {
  await deleteDoc(doc(provasRef(uid), id));
}
