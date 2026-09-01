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

export const anotacaoInputSchema = z.object({
  titulo: z.string().trim().min(1, "Informe o título da anotação").max(140),
  materia: z.string().trim().max(80).optional().default(""),
  conteudo: z
    .string()
    .trim()
    .min(1, "Escreva sua anotação")
    .max(20000, "Anotação longa demais"),
});

export type AnotacaoInput = z.infer<typeof anotacaoInputSchema>;

export const reservaInputSchema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  plano: z.string().trim().max(60).optional().default(""),
  // Campo livre de pesquisa: o que a pessoa mais quer resolver nos estudos.
  objetivo: z.string().trim().max(500).optional().default(""),
});

export type ReservaInput = z.infer<typeof reservaInputSchema>;

// --- Cakto (gateway de pagamento) ------------------------------------------
// Schema do payload real do webhook, conforme a documentação da Cakto.
// Tolerante de propósito: campo novo no payload não pode derrubar o endpoint
// (erro faz a Cakto reenviar até 5 vezes). Só o que usamos é exigido.
//
// A Cakto NÃO assina o payload com HMAC nem manda header de assinatura: a
// prova de origem é o campo `secret` no próprio corpo.
export const caktoWebhookSchema = z.object({
  secret: z.string().optional(),
  event: z.string().trim().min(1),
  data: z
    .object({
      // `id` é a chave de deduplicação recomendada pela própria Cakto.
      id: z.string().optional(),
      refId: z.string().optional(),
      status: z.string().optional(),
      amount: z.union([z.string(), z.number()]).optional(),
      baseAmount: z.union([z.string(), z.number()]).optional(),
      paymentMethod: z.string().optional(),
      installments: z.number().optional(),
      paidAt: z.string().nullish(),
      createdAt: z.string().optional(),
      offer_type: z.string().optional(),
      parent_order: z.string().nullish(),
      customer: z
        .object({
          name: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          birthDate: z.string().optional(),
        })
        .optional(),
      // `offer.id` é o que diz se a compra foi Base ou Pro.
      offer: z
        .object({
          id: z.string().optional(),
          name: z.string().optional(),
          price: z.union([z.string(), z.number()]).optional(),
        })
        .optional(),
      product: z
        .object({
          id: z.string().optional(),
          short_id: z.string().optional(),
          name: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type CaktoWebhook = z.infer<typeof caktoWebhookSchema>;

// --- Agente de IA ----------------------------------------------------------
// Contrato de saída do modelo. Nada é gravado sem passar por aqui: o JSON de
// um LLM é entrada não confiável como qualquer outra.
export const tarefaExtraidaSchema = z.object({
  tipo: z.enum(["atividade", "trabalho", "prova"]),
  titulo: z.string().trim().min(1).max(140),
  materia: z.string().trim().min(1).max(80),
  data: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "data fora do formato YYYY-MM-DD")
    .optional(),
});

export type TarefaExtraida = z.infer<typeof tarefaExtraidaSchema>;

export const extracaoIaSchema = z.object({
  itens: z.array(tarefaExtraidaSchema).max(50),
});

export const extrairIaInputSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(10, "Cole um texto um pouco maior para a IA analisar")
    // Teto de tamanho é controle de custo: limita os tokens de entrada.
    .max(8000, "Texto longo demais — cole no máximo ~8.000 caracteres por vez"),
});

export type ExtrairIaInput = z.infer<typeof extrairIaInputSchema>;

// Resumo estruturado (e não texto corrido): é o que permite formatar o PDF e
// salvar como anotação sem ter que interpretar markdown devolvido pelo modelo.
export const resumoIaSchema = z.object({
  titulo: z.string().trim().min(1).max(140),
  topicos: z
    .array(
      z.object({
        titulo: z.string().trim().min(1).max(140),
        pontos: z.array(z.string().trim().min(1).max(600)).max(10),
      })
    )
    .max(12),
  conclusao: z.string().trim().max(1200).optional(),
});

export type ResumoIa = z.infer<typeof resumoIaSchema>;

// --- Chat do Agente ---------------------------------------------------------
// A resposta vem estruturada porque o assistente faz duas coisas ao mesmo
// tempo: conversa (texto) e, quando reconhece compromissos, devolve tarefas
// prontas para virarem cartões de ação na tela.
export const respostaChatSchema = z.object({
  resposta: z.string().trim().min(1).max(6000),
  tarefas: z.array(tarefaExtraidaSchema).max(30).optional(),
});

export type RespostaChat = z.infer<typeof respostaChatSchema>;

export const mensagemChatSchema = z.object({
  papel: z.enum(["usuario", "assistente"]),
  texto: z.string().trim().min(1).max(8000),
});

export const chatIaInputSchema = z.object({
  mensagens: z.array(mensagemChatSchema).min(1).max(40),
  /** Matérias do usuário, para o assistente sugerir nomes que já existem. */
  materias: z.array(z.string().trim().max(80)).max(40).optional().default([]),
});

export type ChatIaInput = z.infer<typeof chatIaInputSchema>;

export const resumirIaInputSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(200, "Cole um texto maior para valer a pena resumir")
    .max(12000, "Texto longo demais — cole no máximo ~12.000 caracteres por vez"),
  materia: z.string().trim().max(80).optional().default(""),
});

export type ResumirIaInput = z.infer<typeof resumirIaInputSchema>;
