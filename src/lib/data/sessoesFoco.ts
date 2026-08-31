import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  sessaoFocoInputSchema,
  type SessaoFocoInput,
} from "@/lib/validators/dominio";
import { dataLocalISO } from "@/lib/ui/datas";
import type { SessaoFoco } from "@/types/dominio";

function sessoesRef(uid: string) {
  return collection(getFirebaseDb(), "usuarios", uid, "sessoes");
}

export function subscribeToSessoes(
  uid: string,
  onChange: (sessoes: SessaoFoco[]) => void
): Unsubscribe {
  const q = query(sessoesRef(uid), orderBy("criadoEm", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          materia: data.materia,
          mins: data.mins,
          data: data.data,
          hora: data.hora,
        } satisfies SessaoFoco;
      })
    );
  });
}

export async function registrarSessao(uid: string, input: SessaoFocoInput) {
  const dados = sessaoFocoInputSchema.parse(input);
  const agora = new Date();
  await addDoc(sessoesRef(uid), {
    ...dados,
    // Data no calendário de Brasília: com UTC, uma sessão às 21h entraria como
    // sendo do dia seguinte e sumiria do "foco hoje".
    data: dataLocalISO(agora),
    hora: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    criadoEm: serverTimestamp(),
  });
}
