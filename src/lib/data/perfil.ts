import {
  deleteField,
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

// Perfil do usuário guardado no doc usuarios/{uid}. A foto é uma data URL
// (JPEG pequeno, ~160px) — fica dentro do limite de 1MB do documento e do
// plano gratuito do Firestore, sem precisar do Firebase Storage (sem custo).
export type Perfil = { foto?: string };

function perfilRef(uid: string) {
  return doc(getFirebaseDb(), "usuarios", uid);
}

export function subscribeToPerfil(uid: string, onChange: (p: Perfil) => void): Unsubscribe {
  return onSnapshot(perfilRef(uid), (snap) => {
    const data = snap.data() ?? {};
    const foto = typeof data.foto === "string" && data.foto ? data.foto : undefined;
    onChange({ foto });
  });
}

export async function salvarFotoPerfil(uid: string, foto: string): Promise<void> {
  await setDoc(perfilRef(uid), { foto }, { merge: true });
}

export async function removerFotoPerfil(uid: string): Promise<void> {
  await setDoc(perfilRef(uid), { foto: deleteField() }, { merge: true });
}
