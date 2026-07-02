import { z } from "zod";

export const materiaInputSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da matéria").max(80),
  prog: z.coerce.number().int().min(0).max(100).default(0),
});

export type MateriaInput = z.infer<typeof materiaInputSchema>;

export const atividadeInputSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título da atividade").max(140),
  materia: z.string().trim().min(1, "Selecione uma matéria"),
  data: z.string().trim().optional().default(""),
});

export type AtividadeInput = z.infer<typeof atividadeInputSchema>;

export const trabalhoInputSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título do trabalho").max(140),
  materia: z.string().trim().min(1, "Selecione uma matéria"),
  data: z.string().trim().optional().default(""),
});

export type TrabalhoInput = z.infer<typeof trabalhoInputSchema>;

export const provaInputSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título da prova").max(140),
  tipo: z.string().trim().min(1, "Selecione o tipo").max(40),
  materia: z.string().trim().min(1, "Selecione uma matéria"),
  data: z.string().trim().min(1, "Informe a data da prova"),
});

export type ProvaInput = z.infer<typeof provaInputSchema>;

export const sessaoFocoInputSchema = z.object({
  materia: z.string().trim().min(1, "Selecione uma matéria"),
  mins: z.coerce.number().int().min(1).max(600),
});

export type SessaoFocoInput = z.infer<typeof sessaoFocoInputSchema>;
