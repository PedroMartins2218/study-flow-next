export interface Materia {
  id: string;
  nome: string;
  prog: number;
  /** Capa opcional (data URL JPEG comprimida). Sem ela, a tela usa um gradiente. */
  capa?: string;
  criadoEm?: string;
}

/**
 * Etapa no quadro. O booleano `concluida`/`concluido` continua existindo e é
 * mantido em sincronia (`feito` ⇔ true), porque o dashboard e os gráficos
 * contam pendências por ele.
 */
export type SituacaoTarefa = "afazer" | "fazendo" | "feito";

export interface Atividade {
  id: string;
  titulo: string;
  materia: string;
  data?: string;
  concluida: boolean;
  situacao: SituacaoTarefa;
  criadoEm?: string;
}

export interface Trabalho {
  id: string;
  titulo: string;
  materia: string;
  data?: string;
  concluido: boolean;
  situacao: SituacaoTarefa;
  criadoEm?: string;
}

export interface Prova {
  id: string;
  titulo: string;
  tipo: string;
  materia: string;
  data: string;
  criadoEm?: string;
}

export interface SessaoFoco {
  id: string;
  materia: string;
  mins: number;
  data: string;
  hora: string;
}

export interface Perfil {
  nome: string;
  email: string;
}

export interface Anotacao {
  id: string;
  titulo: string;
  materia?: string;
  conteudo: string;
  /** Contador dos anexos da subcoleção, para a lista não precisar baixá-los. */
  qtdAnexos?: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Reserva {
  id: string;
  nome: string;
  email: string;
  plano?: string;
  objetivo?: string;
  criadoEm?: string;
}

// --- Redação ----------------------------------------------------------------

/** Nível atribuído a uma competência: 0 a 5, que vira nota multiplicando por 40. */
export type NivelCompetencia = 0 | 1 | 2 | 3 | 4 | 5;

export interface CompetenciaAvaliada {
  numero: 1 | 2 | 3 | 4 | 5;
  /** Trechos citados da própria redação que sustentam o nível dado. */
  evidencias: string[];
  diagnostico: string;
  nivel: NivelCompetencia;
  /** Sempre `nivel * 40` — calculado por nós, nunca pelo modelo. */
  nota: number;
}

export type MotivoZero =
  | "fuga_ao_tema"
  | "tipo_textual"
  | "texto_insuficiente"
  | "copia_integral";

/**
 * Leitura estilística do modelo sobre a chance de o texto ter saído de uma IA.
 * É indício, nunca veredito: detectores de IA erram muito, e a tela precisa
 * dizer isso. O sinal forte de verdade é a `Proveniencia`, medida no editor.
 */
export interface IndiciosIa {
  nivel: "baixo" | "medio" | "alto";
  sinais: string[];
}

export interface CorrecaoEnem {
  competencias: CompetenciaAvaliada[];
  notaTotal: number;
  pontosFortes: string[];
  proximosPassos: string[];
  /** Preenchido só quando a redação cairia numa das situações de anulação. */
  zerada?: { motivo: MotivoZero; explicacao: string };
  indiciosIa: IndiciosIa;
}

export interface TrechoCopiado {
  texto: string;
  fonte: string;
}

export interface ResultadoPlagio {
  /** Percentual de palavras do texto cobertas por trecho copiado (0–100). */
  percentual: number;
  trechos: TrechoCopiado[];
}

export type OrigemTexto = "digitado" | "misto" | "colado";

/**
 * Como o texto chegou ao editor — medido no ato da escrita, não inferido do
 * resultado. "Colado" é um fato observado, e não uma acusação de uso de IA:
 * quem escreveu no Word e colou cai aqui do mesmo jeito.
 */
export interface Proveniencia {
  caracteresDigitados: number;
  caracteresColados: number;
  eventosColagem: number;
  tempoEdicaoSegundos: number;
  origem: OrigemTexto;
}

export interface Redacao {
  id: string;
  tema: string;
  texto: string;
  textoMotivador?: string;
  correcao: CorrecaoEnem;
  plagio: ResultadoPlagio;
  proveniencia: Proveniencia;
  criadoEm?: string;
}

export type StatusAssinatura =
  | "ativo"
  | "trial"
  | "inadimplente" // pagamento falhou; mantém acesso até a expiração (carência)
  | "cancelado" // cancelou/reembolsou; acesso segue até o fim do ciclo pago
  | "expirado"
  | "inativo";

// O que a pessoa comprou. Separado de `plano` (rótulo livre, ex.: "Nexo Study
// Pro") porque é isto — e só isto — que libera ou bloqueia o Agente de IA.
export type TierAssinatura = "base" | "pro";

export interface Assinatura {
  status: StatusAssinatura;
  tier?: TierAssinatura;
  plano?: string;
  expiracao?: string;
  /**
   * Acesso vitalício (compra única, sem renovação). Quando true, o acesso
   * não olha `expiracao` — ver `assinaturaEstaAtiva`.
   *
   * É um campo explícito de propósito: antes, "acesso sem prazo" era
   * representado pela AUSÊNCIA de `expiracao`, o que é fácil de quebrar sem
   * perceber (qualquer escrita que preenchesse a data revogaria o vitalício
   * em silêncio). Vitalício sempre vem com `tier: "pro"`.
   */
  vitalicio?: boolean;
}
