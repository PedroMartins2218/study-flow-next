// Detecção de cópia por sobreposição de n-gramas. Sem IA de propósito: um
// modelo de linguagem não tem acervo para comparar e, se pedirmos um "%", ele
// devolve um número inventado. Aqui o percentual é aritmética verificável.
//
// O plágio que o ENEM de fato pune é a cópia dos textos motivadores (leva a
// penalização na C2/C3 e, se for integral, à nota zero). É exatamente isso que
// medimos, mais o reuso de redações anteriores do próprio aluno.

import type { ResultadoPlagio } from "@/types/dominio";

/**
 * Tamanho da janela de comparação, em palavras.
 *
 * 7 é o equilíbrio: curto o bastante para pegar cópia literal de meia frase,
 * largo o bastante para não acusar conectivo batido ("em virtude disso é
 * notório que"), que tem 6 palavras e aparece em redação honesta.
 */
const TAMANHO_SHINGLE = 7;

/** Teto de trechos devolvidos, para o documento no Firestore não crescer. */
const MAX_TRECHOS = 5;
const MAX_CHARS_TRECHO = 400;

export interface FonteComparacao {
  /** Como o trecho será creditado na tela ("Texto motivador", "Redação de 12/03"). */
  rotulo: string;
  conteudo: string;
}

interface Token {
  normal: string;
  inicio: number;
  fim: number;
}

/**
 * Quebra o texto em palavras normalizadas, guardando onde cada uma começa e
 * termina no original — é o que permite devolver o trecho copiado com a
 * acentuação e a pontuação de verdade, e não a versão achatada.
 *
 * A regex de letras/números Unicode já descarta pontuação sem precisar de uma
 * lista de caracteres.
 */
function tokenizar(texto: string): Token[] {
  const tokens: Token[] = [];
  const re = /[\p{L}\p{N}]+/gu;
  let achado: RegExpExecArray | null;

  while ((achado = re.exec(texto)) !== null) {
    tokens.push({
      normal: achado[0]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
      inicio: achado.index,
      fim: achado.index + achado[0].length,
    });
  }

  return tokens;
}

function shinglesDe(texto: string): Set<string> {
  const palavras = tokenizar(texto).map((t) => t.normal);
  const conjunto = new Set<string>();

  for (let i = 0; i + TAMANHO_SHINGLE <= palavras.length; i++) {
    conjunto.add(palavras.slice(i, i + TAMANHO_SHINGLE).join(" "));
  }

  return conjunto;
}

function recortar(texto: string): string {
  const limpo = texto.replace(/\s+/g, " ").trim();
  return limpo.length > MAX_CHARS_TRECHO
    ? `${limpo.slice(0, MAX_CHARS_TRECHO).trimEnd()}…`
    : limpo;
}

/**
 * Compara o texto contra as fontes e devolve quanto dele é cópia.
 *
 * O percentual é medido em **palavras cobertas**, não em janelas casadas: uma
 * janela que casa na posição i cobre as 7 palavras de i a i+6, e o que conta é
 * a união dessas coberturas. É a leitura que bate com a pergunta do aluno
 * ("quanto da minha redação é copiado?").
 *
 * O tema NÃO entra como fonte: retomar o enunciado na introdução é esperado no
 * ENEM, e acusar isso seria falso positivo garantido.
 */
export function compararComFontes(
  texto: string,
  fontes: FonteComparacao[]
): ResultadoPlagio {
  const tokens = tokenizar(texto);

  // Texto curto demais para formar uma única janela: não há o que medir.
  if (tokens.length < TAMANHO_SHINGLE) {
    return { percentual: 0, trechos: [] };
  }

  // Índice janela -> rótulo da fonte. A primeira fonte que contiver a janela
  // leva o crédito; saber que copiou já basta, de qual das duas é detalhe.
  const indice = new Map<string, string>();
  for (const fonte of fontes) {
    if (!fonte.conteudo.trim()) continue;
    for (const shingle of shinglesDe(fonte.conteudo)) {
      if (!indice.has(shingle)) indice.set(shingle, fonte.rotulo);
    }
  }

  if (indice.size === 0) {
    return { percentual: 0, trechos: [] };
  }

  // Para cada posição inicial de janela, de qual fonte ela veio (ou null).
  const origens: (string | null)[] = [];
  for (let i = 0; i + TAMANHO_SHINGLE <= tokens.length; i++) {
    const shingle = tokens
      .slice(i, i + TAMANHO_SHINGLE)
      .map((t) => t.normal)
      .join(" ");
    origens.push(indice.get(shingle) ?? null);
  }

  // Corridas contíguas de janelas casadas viram um trecho só. Uma corrida que
  // vai de `i` a `j` cobre as palavras de `i` até `j + TAMANHO_SHINGLE - 1`.
  const cobertas = new Set<number>();
  const trechos: { texto: string; fonte: string; tamanho: number }[] = [];

  let i = 0;
  while (i < origens.length) {
    const fonte = origens[i];
    if (fonte === null) {
      i++;
      continue;
    }

    let fim = i;
    while (fim + 1 < origens.length && origens[fim + 1] !== null) fim++;

    const primeiraPalavra = i;
    const ultimaPalavra = fim + TAMANHO_SHINGLE - 1;
    for (let p = primeiraPalavra; p <= ultimaPalavra; p++) cobertas.add(p);

    trechos.push({
      texto: recortar(texto.slice(tokens[primeiraPalavra].inicio, tokens[ultimaPalavra].fim)),
      fonte,
      tamanho: ultimaPalavra - primeiraPalavra + 1,
    });

    i = fim + 1;
  }

  return {
    percentual: Math.round((cobertas.size / tokens.length) * 100),
    // Os trechos mais longos são os que interessam ao aluno.
    trechos: trechos
      .sort((a, b) => b.tamanho - a.tamanho)
      .slice(0, MAX_TRECHOS)
      .map(({ texto, fonte }) => ({ texto, fonte })),
  };
}
