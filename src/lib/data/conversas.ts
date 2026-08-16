import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { TarefaExtraida } from "@/lib/validators/studyflow";

/**
 * Conversas com o Agente de IA.
 *
 * Estrutura espelhada na dos anexos, e pelo mesmo motivo: as mensagens ficam em
 * SUBCOLEÇÃO. A lista lateral precisa só de título e data — carregar o corpo de
 * todas as conversas para desenhar a lista seria desperdício crescente à medida
 * que o histórico aumenta.
 */

export type PapelMensagem = "usuario" | "assistente";

export interface Mensagem {
  id: string;
  papel: PapelMensagem;
  texto: string;
  /** Tarefas que o assistente identificou, se houver. */
  tarefas?: TarefaExtraida[];
  criadoEm?: string;
}

export interface Conversa {
  id: string;
  titulo: string;
  atualizadoEm?: string;
}

/** Quantas mensagens vão como contexto para o modelo (controle de custo). */
export const JANELA_CONTEXTO = 20;

function conversasRef(uid: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "conversas");
}

function mensagensRef(uid: string, conversaId: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "conversas", conversaId, "mensagens");
}

export function subscribeToConversas(
  uid: string,
  onChange: (conversas: Conversa[]) => void
): Unsubscribe {
  const q = query(conversasRef(uid), orderBy("atualizadoEm", "desc"), limit(60));
  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            titulo: data.titulo || "Nova conversa",
            atualizadoEm: data.atualizadoEm?.toDate?.().toISOString(),
          } satisfies Conversa;
        })
      );
    },
    () => onChange([])
  );
}

export function subscribeToMensagens(
  uid: string,
  conversaId: string,
  onChange: (mensagens: Mensagem[]) => void
): Unsubscribe {
  const q = query(mensagensRef(uid, conversaId), orderBy("criadoEm", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            papel: data.papel,
            texto: data.texto ?? "",
            tarefas: data.tarefas ?? undefined,
            criadoEm: data.criadoEm?.toDate?.().toISOString(),
          } satisfies Mensagem;
        })
      );
    },
    () => onChange([])
  );
}

/** Título da conversa a partir da primeira pergunta, no estilo dos chats. */
export function tituloDaPrimeiraMensagem(texto: string): string {
  const limpo = texto.trim().replace(/\s+/g, " ");
  return limpo.length <= 48 ? limpo : `${limpo.slice(0, 48)}...`;
}

export async function criarConversa(uid: string, titulo: string): Promise<string> {
  const ref = await addDoc(conversasRef(uid), {
    titulo: titulo.slice(0, 120),
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function adicionarMensagem(
  uid: string,
  conversaId: string,
  mensagem: { papel: PapelMensagem; texto: string; tarefas?: TarefaExtraida[] }
): Promise<void> {
  await addDoc(mensagensRef(uid, conversaId), {
    papel: mensagem.papel,
    texto: mensagem.texto,
    // undefined quebra o Firestore; só grava o campo quando existe.
    ...(mensagem.tarefas?.length ? { tarefas: mensagem.tarefas } : {}),
    criadoEm: serverTimestamp(),
  });
  // Move a conversa para o topo da lista.
  await updateDoc(doc(conversasRef(uid), conversaId), {
    atualizadoEm: serverTimestamp(),
  });
}

export async function renomearConversa(
  uid: string,
  conversaId: string,
  titulo: string
): Promise<void> {
  await updateDoc(doc(conversasRef(uid), conversaId), {
    titulo: titulo.trim().slice(0, 120) || "Nova conversa",
  });
}

/**
 * Apaga a conversa e suas mensagens. O Firestore não remove subcoleções em
 * cascata — sem isto, as mensagens ficariam órfãs ocupando espaço.
 */
export async function removerConversa(uid: string, conversaId: string): Promise<void> {
  const snap = await getDocs(mensagensRef(uid, conversaId));
  if (!snap.empty) {
    const lote = writeBatch(getFirebaseDb());
    snap.docs.forEach((d) => lote.delete(d.ref));
    await lote.commit();
  }
  await deleteDoc(doc(conversasRef(uid), conversaId));
}
