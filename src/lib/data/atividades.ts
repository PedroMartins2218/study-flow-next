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
import type { Atividade, SituacaoTarefa } from "@/types/studyflow";

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
        const concluida = Boolean(data.concluida);
        return {
          id: d.id,
          titulo: data.titulo,
          materia: data.materia,
          data: data.data,
          concluida,
          // Atividades criadas antes do quadro não têm `situacao`: derivamos do
          // booleano para elas aparecerem na coluna certa sem migração.
          situacao: data.situacao ?? (concluida ? "feito" : "afazer"),
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

export async function atualizarAtividade(
  uid: string,
  id: string,
  input: AtividadeInput
) {
  const dados = atividadeInputSchema.parse(input);
  await updateDoc(doc(atividadesRef(uid), id), dados);
}

export async function alternarAtividade(
  uid: string,
  id: string,
  concluida: boolean
) {
  await updateDoc(doc(atividadesRef(uid), id), {
    concluida,
    situacao: concluida ? "feito" : "afazer",
  });
}

/**
 * Move a atividade de coluna no quadro.
 * Grava também `concluida` porque o dashboard e os gráficos contam pendências
 * pelo booleano — deixar os dois fora de sincronia faria o painel mentir.
 */
export async function moverAtividade(
  uid: string,
  id: string,
  situacao: SituacaoTarefa
) {
  await updateDoc(doc(atividadesRef(uid), id), {
    situacao,
    concluida: situacao === "feito",
  });
}

export async function removerAtividade(uid: string, id: string) {
  await deleteDoc(doc(atividadesRef(uid), id));
}
