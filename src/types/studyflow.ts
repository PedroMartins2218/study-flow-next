export interface Materia {
  id: string;
  nome: string;
  prog: number;
  criadoEm?: string;
}

export interface Atividade {
  id: string;
  titulo: string;
  materia: string;
  data?: string;
  concluida: boolean;
  criadoEm?: string;
}

export interface Trabalho {
  id: string;
  titulo: string;
  materia: string;
  data?: string;
  concluido: boolean;
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

export interface Reserva {
  id: string;
  nome: string;
  email: string;
  plano?: string;
  objetivo?: string;
  criadoEm?: string;
}

export type StatusAssinatura = "ativo" | "inativo" | "expirado" | "trial";

export interface Assinatura {
  status: StatusAssinatura;
  plano?: string;
  expiracao?: string;
}
