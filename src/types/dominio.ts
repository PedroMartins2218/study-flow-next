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
