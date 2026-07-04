import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { diasAte, hojeISO } from "@/lib/ui/datas";

// Preferências de lembretes (por dispositivo, guardadas no localStorage — as
// notificações do navegador são específicas do aparelho de qualquer forma).
export type PrefsLembretes = {
  ativo: boolean;
  provas: boolean;
  atividades: boolean;
  trabalhos: boolean;
};

export const PREFS_PADRAO: PrefsLembretes = {
  ativo: false,
  provas: true,
  atividades: true,
  trabalhos: true,
};

const CHAVE = "sf_lembretes";
const CHAVE_DATA = "sf_lembretes_data";

export function lerPrefs(): PrefsLembretes {
  if (typeof window === "undefined") return PREFS_PADRAO;
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return PREFS_PADRAO;
    return { ...PREFS_PADRAO, ...JSON.parse(raw) };
  } catch {
    return PREFS_PADRAO;
  }
}

export function salvarPrefs(p: PrefsLembretes) {
  localStorage.setItem(CHAVE, JSON.stringify(p));
  // permite que o runner rode de novo hoje com as novas preferências
  localStorage.removeItem(CHAVE_DATA);
}

export function jaRodouHoje(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(CHAVE_DATA) === hojeISO();
}

export function marcarRodadoHoje() {
  localStorage.setItem(CHAVE_DATA, hojeISO());
}

// Monta as mensagens de lembrete com base no que está próximo/atrasado.
export async function montarLembretes(
  uid: string,
  prefs: PrefsLembretes
): Promise<string[]> {
  const db = getFirebaseDb();
  const hoje = hojeISO();
  const msgs: string[] = [];

  if (prefs.provas) {
    const snap = await getDocs(collection(db, "usuarios", uid, "provas"));
    for (const d of snap.docs) {
      const p = d.data() as { materia?: string; data?: string };
      if (p.data && p.data >= hoje) {
        const n = diasAte(p.data);
        if (n <= 2) {
          const quando = n === 0 ? "é hoje" : n === 1 ? "é amanhã" : `em ${n} dias`;
          msgs.push(`Prova de ${p.materia ?? "matéria"} ${quando}`);
        }
      }
    }
  }

  if (prefs.atividades) {
    const snap = await getDocs(collection(db, "usuarios", uid, "atividades"));
    const n = snap.docs.filter((d) => {
      const a = d.data() as { concluida?: boolean; data?: string };
      return !a.concluida && a.data && a.data <= hoje;
    }).length;
    if (n) msgs.push(`Você tem ${n} atividade${n > 1 ? "s" : ""} para hoje ou atrasada${n > 1 ? "s" : ""}`);
  }

  if (prefs.trabalhos) {
    const snap = await getDocs(collection(db, "usuarios", uid, "trabalhos"));
    const n = snap.docs.filter((d) => {
      const t = d.data() as { concluido?: boolean; data?: string };
      return !t.concluido && t.data && t.data <= hoje;
    }).length;
    if (n) msgs.push(`Você tem ${n} trabalho${n > 1 ? "s" : ""} para hoje ou atrasado${n > 1 ? "s" : ""}`);
  }

  return msgs;
}
