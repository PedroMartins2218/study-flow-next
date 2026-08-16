import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

/**
 * Anexos de uma anotação (fotos de caderno, prints de resumo).
 *
 * Ficam em SUBCOLEÇÃO, e não dentro do documento da anotação, por um motivo
 * concreto: `subscribeToAnotacoes` baixa todas as anotações de uma vez. Se a
 * imagem morasse na anotação, abrir o Caderno significaria baixar as imagens de
 * todas elas — vários MB no celular. Aqui, só carregam quando a anotação é
 * aberta; a lista usa o contador `qtdAnexos` gravado na própria anotação.
 */

export interface Anexo {
  id: string;
  nome: string;
  imagem: string;
  criadoEm?: string;
}

export const MAX_ANEXOS = 5;

function anexosRef(uid: string, anotacaoId: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "anotacoes", anotacaoId, "anexos");
}

function anotacaoRef(uid: string, anotacaoId: string) {
  return doc(getFirebaseDb(), "usuarios", uid, "anotacoes", anotacaoId);
}

export function subscribeToAnexos(
  uid: string,
  anotacaoId: string,
  onChange: (anexos: Anexo[]) => void
): Unsubscribe {
  const q = query(anexosRef(uid, anotacaoId), orderBy("criadoEm", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nome: data.nome ?? "anexo",
            imagem: data.imagem,
            criadoEm: data.criadoEm?.toDate?.().toISOString(),
          } satisfies Anexo;
        })
      );
    },
    () => onChange([])
  );
}

export async function adicionarAnexo(
  uid: string,
  anotacaoId: string,
  nome: string,
  imagem: string
): Promise<void> {
  await addDoc(anexosRef(uid, anotacaoId), {
    nome: nome.slice(0, 120),
    imagem,
    criadoEm: serverTimestamp(),
  });
  // Contador que a lista lê sem precisar baixar as imagens.
  await updateDoc(anotacaoRef(uid, anotacaoId), { qtdAnexos: increment(1) });
}

export async function removerAnexo(
  uid: string,
  anotacaoId: string,
  anexoId: string
): Promise<void> {
  await deleteDoc(doc(anexosRef(uid, anotacaoId), anexoId));
  await updateDoc(anotacaoRef(uid, anotacaoId), { qtdAnexos: increment(-1) });
}

/**
 * Apaga os anexos antes de apagar a anotação. O Firestore não remove
 * subcoleções em cascata — sem isto, as imagens ficariam órfãs ocupando espaço.
 */
export async function removerTodosAnexos(uid: string, anotacaoId: string): Promise<void> {
  const snap = await getDocs(anexosRef(uid, anotacaoId));
  if (snap.empty) return;
  const lote = writeBatch(getFirebaseDb());
  snap.docs.forEach((d) => lote.delete(d.ref));
  await lote.commit();
}
