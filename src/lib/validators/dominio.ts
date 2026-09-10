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

// --- Redação ----------------------------------------------------------------

export const provenienciaSchema = z.object({
  caracteresDigitados: z.coerce.number().int().min(0).max(1_000_000),
  caracteresColados: z.coerce.number().int().min(0).max(1_000_000),
  eventosColagem: z.coerce.number().int().min(0).max(10_000),
  tempoEdicaoSegundos: z.coerce.number().int().min(0).max(86_400),
  origem: z.enum(["digitado", "misto", "colado"]),
});

export const corrigirRedacaoInputSchema = z.object({
  tema: z
    .string()
    .trim()
    .min(5, "Informe o tema da redação")
    .max(300, "Tema longo demais"),
  // O piso é baixo de propósito: uma redação de 3 linhas PRECISA ser aceita
  // para o corretor poder dizer que ela zeraria por texto insuficiente —
  // barrar aqui esconderia justamente a informação mais útil. O teto é
  // controle de custo (redação de ENEM tem 30 linhas, ~3.000 caracteres).
  texto: z
    .string()
    .trim()
    .min(50, "Escreva um pouco mais antes de enviar para correção")
    .max(6000, "Texto longo demais — a redação do ENEM tem no máximo 30 linhas"),
  textoMotivador: z
    .string()
    .trim()
    .max(5000, "Textos motivadores longos demais — cole no máximo ~5.000 caracteres")
    .optional()
    .default(""),
  proveniencia: provenienciaSchema,
});

export type CorrigirRedacaoInput = z.infer<typeof corrigirRedacaoInputSchema>;

/**
 * Saída crua do modelo. Repare que NÃO há `nota` nem `notaTotal`: o modelo
 * devolve só o nível (0–5) e a aritmética é feita no nosso código. LLM erra
 * conta, e uma soma errada aqui destruiria a confiança na nota inteira.
 */
// Três coisas NÃO estão aqui de propósito, porque não são julgamento e sim
// consequência, e o modelo erra todas as três:
//   `nota`/`notaTotal` — aritmética (nivel * 40 e a soma), feita no código;
//   `zerada`           — anulação, derivada do tamanho do texto e do nível 0
//                        da C2. Com um campo livre, o modelo anulava por
//                        impulso: na aferição, a mesma redação forte foi
//                        anulada em 2 de 3 execuções.
// Os tetos de lista são folgados: modelo prolixo não pode invalidar uma
// correção boa e queimar a chamada paga. Quem apara é `corrigirRedacao`.
export const correcaoIaSchema = z.object({
  competencias: z
    .array(
      z.object({
        numero: z.union([
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.literal(4),
          z.literal(5),
        ]),
        evidencias: z.array(z.string().trim().min(1).max(400)).max(12),
        diagnostico: z.string().trim().min(1).max(900),
        nivel: z.coerce.number().int().min(0).max(5),
      })
    )
    .min(5, "a correção precisa cobrir as cinco competências")
    .max(10),
  pontosFortes: z.array(z.string().trim().min(1).max(300)).max(12).optional().default([]),
  proximosPassos: z.array(z.string().trim().min(1).max(300)).max(12).optional().default([]),
  indiciosIa: z.object({
    nivel: z.enum(["baixo", "medio", "alto"]),
    sinais: z.array(z.string().trim().min(1).max(300)).max(12).optional().default([]),
  }),
});

export type CorrecaoIa = z.infer<typeof correcaoIaSchema>;

const trechoCopiadoSchema = z.object({
  texto: z.string().trim().min(1).max(500),
  fonte: z.string().trim().min(1).max(120),
});

const competenciaAvaliadaSchema = z.object({
  numero: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  evidencias: z.array(z.string().trim().max(400)).max(4),
  diagnostico: z.string().trim().max(900),
  nivel: z.coerce.number().int().min(0).max(5),
  nota: z.coerce.number().int().min(0).max(200),
});

/** O que é gravado em `usuarios/{uid}/redacoes`. */
export const redacaoInputSchema = z.object({
  tema: z.string().trim().min(1).max(300),
  texto: z.string().trim().min(1).max(6000),
  textoMotivador: z.string().trim().max(5000).optional().default(""),
  correcao: z.object({
    competencias: z.array(competenciaAvaliadaSchema).length(5),
    notaTotal: z.coerce.number().int().min(0).max(1000),
    pontosFortes: z.array(z.string().trim().max(300)).max(5),
    proximosPassos: z.array(z.string().trim().max(300)).max(5),
    zerada: z
      .object({
        motivo: z.enum(["fuga_ao_tema", "tipo_textual", "texto_insuficiente", "copia_integral"]),
        explicacao: z.string().trim().max(600),
      })
      .optional(),
    indiciosIa: z.object({
      nivel: z.enum(["baixo", "medio", "alto"]),
      sinais: z.array(z.string().trim().max(300)).max(5),
    }),
  }),
  plagio: z.object({
    percentual: z.coerce.number().int().min(0).max(100),
    trechos: z.array(trechoCopiadoSchema).max(5),
  }),
  proveniencia: provenienciaSchema,
});

export type RedacaoInput = z.infer<typeof redacaoInputSchema>;

export const resumirIaInputSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(200, "Cole um texto maior para valer a pena resumir")
    .max(12000, "Texto longo demais — cole no máximo ~12.000 caracteres por vez"),
  materia: z.string().trim().max(80).optional().default(""),
});

export type ResumirIaInput = z.infer<typeof resumirIaInputSchema>;
