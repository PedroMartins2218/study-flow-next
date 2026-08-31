import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { materiaInputSchema, type MateriaInput } from "@/lib/validators/dominio";
import type { Materia } from "@/types/dominio";

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
          capa: data.capa || undefined,
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

/**
 * Grava (ou apaga) a capa da matéria. Fica fora de `atualizarMateria` porque a
 * capa não passa pelo schema do formulário — é uma data URL longa.
 */
export async function definirCapaMateria(uid: string, id: string, capa: string | null) {
  await updateDoc(doc(materiasRef(uid), id), {
    capa: capa ?? deleteField(),
  });
}

export async function removerMateria(uid: string, id: string) {
  await deleteDoc(doc(materiasRef(uid), id));
}
