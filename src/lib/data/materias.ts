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
import { materiaInputSchema, type MateriaInput } from "@/lib/validators/studyflow";
import type { Materia } from "@/types/studyflow";

function materiasRef(uid: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "materias");
}

export function subscribeToMaterias(
  uid: string,
  onChange: (materias: Materia[]) => void
): Unsubscribe {
  const q = query(materiasRef(uid), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          nome: data.nome,
          prog: data.prog,
          criadoEm: data.criadoEm?.toDate?.().toISOString(),
        } satisfies Materia;
      })
    );
  });
}

export async function criarMateria(uid: string, input: MateriaInput) {
  const dados = materiaInputSchema.parse(input);
  await addDoc(materiasRef(uid), { ...dados, criadoEm: serverTimestamp() });
}

export async function atualizarMateria(
  uid: string,
  id: string,
  input: Partial<MateriaInput>
) {
  const dados = materiaInputSchema.partial().parse(input);
  await updateDoc(doc(materiasRef(uid), id), dados);
}

export async function removerMateria(uid: string, id: string) {
  await deleteDoc(doc(materiasRef(uid), id));
}
