import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Assinatura } from "@/types/studyflow";

// As regras de acesso vivem em assinaturaCore.ts (sem Firebase) para o servidor
// poder aplicar as mesmas. Reexportadas aqui para o cliente não precisar saber
// dessa divisão.
export { assinaturaEstaAtiva, temAcessoIa } from "@/lib/data/assinaturaCore";

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
        tier: data.tier,
        plano: data.plano,
        expiracao: data.expiracao,
      });
    },
    () => onChange(null)
  );
}
