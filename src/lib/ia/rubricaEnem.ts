// Rubrica oficial do ENEM, transcrita para dentro do prompt.
//
// Está em arquivo próprio porque é o prompt mais longo do projeto e porque é a
// peça que determina a qualidade da correção: sem a rubrica descrita nível a
// nível, um LLM avaliador vira uma máquina de elogiar — a nota vai para 900+
// em qualquer texto minimamente arrumado. Com os seis níveis explícitos, ele
// tem onde ancorar o julgamento.

/** Cada competência vale de 0 a 200, em degraus de 40 (nível 0 a 5). */
export const PESO_NIVEL = 40;
export const NOTA_MAXIMA = 1000;

export const COMPETENCIAS = [
  {
    numero: 1,
    titulo: "Domínio da modalidade escrita formal da língua portuguesa",
    niveis: [
      "0 — Desconhecimento da modalidade escrita formal.",
      "1 — Domínio precário, com desvios gramaticais, de escolha de registro e de convenções da escrita frequentes e diversificados.",
      "2 — Domínio insuficiente, com muitos desvios gramaticais, de escolha de registro e de convenções da escrita.",
      "3 — Domínio mediano, com alguns desvios gramaticais e de convenções da escrita.",
      "4 — Bom domínio, com poucos desvios gramaticais e de convenções da escrita.",
      "5 — Excelente domínio, com raríssimos desvios gramaticais e de convenções da escrita.",
    ],
  },
  {
    numero: 2,
    titulo:
      "Compreender a proposta e desenvolver o tema dentro da estrutura dissertativo-argumentativa",
    niveis: [
      "0 — Fuga ao tema ou não atendimento à estrutura dissertativo-argumentativa. Anula a redação.",
      "1 — Tangencia o tema, ou domínio precário do tipo textual, com traços constantes de outros tipos.",
      "2 — Desenvolve o tema recorrendo à cópia dos textos motivadores, ou domínio insuficiente do tipo textual (falta proposição, argumentação ou conclusão).",
      "3 — Argumentação previsível e domínio mediano do texto dissertativo-argumentativo, com proposição, argumentação e conclusão.",
      "4 — Argumentação consistente e bom domínio do tipo textual, com proposição, argumentação e conclusão.",
      "5 — Argumentação consistente a partir de repertório sociocultural produtivo e legitimado, e excelente domínio do tipo textual.",
    ],
  },
  {
    numero: 3,
    titulo: "Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista",
    niveis: [
      "0 — Informações não relacionadas ao tema e sem defesa de ponto de vista.",
      "1 — Informações pouco relacionadas ao tema ou incoerentes, sem defesa de ponto de vista.",
      "2 — Informações relacionadas ao tema, mas desorganizadas ou contraditórias e limitadas aos textos motivadores.",
      "3 — Informações relacionadas ao tema, limitadas aos argumentos dos textos motivadores e pouco organizadas.",
      "4 — Informações organizadas, com indícios de autoria, em defesa de um ponto de vista.",
      "5 — Informações consistentes e organizadas, configurando autoria, em defesa de um ponto de vista.",
    ],
  },
  {
    numero: 4,
    titulo: "Mecanismos linguísticos de coesão e articulação da argumentação",
    niveis: [
      "0 — Não articula as informações.",
      "1 — Articula as partes do texto de forma precária.",
      "2 — Articulação insuficiente, com muitas inadequações, e repertório limitado de recursos coesivos.",
      "3 — Articulação mediana, com inadequações, e repertório pouco diversificado de recursos coesivos.",
      "4 — Articula as partes do texto com poucas inadequações e repertório diversificado de recursos coesivos.",
      "5 — Articula bem as partes do texto e apresenta repertório diversificado de recursos coesivos.",
    ],
  },
  {
    numero: 5,
    titulo: "Proposta de intervenção que respeite os direitos humanos",
    niveis: [
      "0 — Não apresenta proposta de intervenção, ou apresenta proposta não relacionada ao tema.",
      "1 — Proposta vaga, precária ou relacionada apenas ao assunto (1 elemento válido).",
      "2 — Proposta insuficiente ou não articulada à discussão do texto (2 elementos válidos).",
      "3 — Proposta mediana, relacionada ao tema e articulada à discussão (3 elementos válidos).",
      "4 — Proposta bem elaborada, relacionada ao tema e articulada à discussão (4 elementos válidos).",
      "5 — Proposta muito bem elaborada e detalhada, relacionada ao tema e articulada à discussão (5 elementos válidos).",
    ],
  },
] as const;

/** Os cinco elementos que a banca conta na proposta de intervenção da C5. */
export const ELEMENTOS_INTERVENCAO =
  "ação (o que fazer), agente (quem faz), meio/modo (como faz), efeito (para quê) e detalhamento (um dos anteriores explicado a fundo)";

/**
 * Abaixo disto o texto é insuficiente (as ~7 linhas que zeram no ENEM).
 *
 * Quem decide isso é o código, não o modelo: em teste, o Gemini anulou por
 * "menos de 15 linhas" uma redação de 1.100 caracteres, que está muito acima do
 * limite. Contar caractere é aritmética, e LLM erra conta — pelo mesmo motivo
 * a soma das notas também é feita fora do modelo.
 */
export const LIMITE_TEXTO_INSUFICIENTE = 400;

/**
 * Monta a rubrica completa para o prompt. Recebida como texto único porque é
 * `systemInstruction`, e não conteúdo do usuário.
 */
export function rubricaCompleta(): string {
  const blocos = COMPETENCIAS.map((c) =>
    [`COMPETÊNCIA ${c.numero} — ${c.titulo}`, ...c.niveis.map((n) => `  ${n}`)].join("\n")
  );

  return blocos.join("\n\n");
}
