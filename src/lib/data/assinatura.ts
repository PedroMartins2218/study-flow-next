import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Assinatura } from "@/types/studyflow";

export function assinaturaEstaAtiva(assinatura: Assinatura | null): boolean {
  if (!assinatura) return false;
  if (assinatura.status !== "ativo" && assinatura.status !== "trial") return false;
  if (!assinatura.expiracao) return true;
  const hoje = new Date().toISOString().split("T")[0];
  return assinatura.expiracao >= hoje;
}

export function subscribeToAssinatura(
  uid: string,
  onChange: (assinatura: Assinatura | null) => void
): Unsubscribe {
  const ref = doc(getFirebaseDb(), "assinaturas", uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      const data = snap.data();
      onChange({
        status: data.status,
        plano: data.plano,
        expiracao: data.expiracao,
      });
    },
    () => onChange(null)
  );
}
