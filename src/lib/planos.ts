import type { TierAssinatura } from "@/types/studyflow";

// Fonte única de preço e copy dos planos. A landing e a tela de assinatura
// leem daqui — mudou o preço, muda só neste arquivo.
//
// Os links de checkout são hospedados pela Kirvano (é lá que os dados de
// pagamento trafegam; nada de cartão passa pelo nosso domínio).

export interface Plano {
  tier: TierAssinatura;
  nome: string;
  preco: string;
  porDia: string;
  resumo: string;
  checkoutUrl?: string;
  beneficios: string[];
  destaque?: string;
}

const BENEFICIOS_BASE = [
  "Matérias e progresso ilimitados",
  "Atividades e trabalhos organizados por prazo",
  "Provas e simulados com contagem regressiva",
  "Caderno de estudos para suas anotações",
  "Modo foco (Pomodoro) com histórico de sessões",
  "Gráficos de evolução por matéria",
  "Acesso pelo navegador, no computador ou celular",
];

export const PLANO_BASE: Plano = {
  tier: "base",
  nome: "Base",
  preco: "R$ 29,90",
  porDia: "Menos de R$ 1 por dia",
  resumo: "Todas as ferramentas de organização da sua rotina de estudos.",
  checkoutUrl: process.env.NEXT_PUBLIC_KIRVANO_CHECKOUT_BASE_URL,
  beneficios: BENEFICIOS_BASE,
};

export const PLANO_PRO: Plano = {
  tier: "pro",
  nome: "Pro",
  preco: "R$ 49,90",
  porDia: "Menos de R$ 1,70 por dia",
  resumo: "Tudo do Base + o Agente de IA que monta sua rotina por você.",
  checkoutUrl: process.env.NEXT_PUBLIC_KIRVANO_CHECKOUT_PRO_URL,
  destaque: "Mais completo",
  beneficios: [
    ...BENEFICIOS_BASE,
    "Agente de IA: cole o edital ou plano de ensino e ele extrai as tarefas",
    "Datas de provas e trabalhos identificadas e agendadas automaticamente",
    "Revisão do que a IA sugeriu antes de salvar — você tem a palavra final",
  ],
};

export const PLANOS: Plano[] = [PLANO_BASE, PLANO_PRO];

export function planoDoTier(tier: TierAssinatura | undefined): Plano | null {
  if (tier === "pro") return PLANO_PRO;
  if (tier === "base") return PLANO_BASE;
  return null;
}
