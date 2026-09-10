// Mede a precisão do corretor de redação.
//
// Sem isto, ajustar o prompt é fé: você muda uma frase, roda uma redação e acha
// que melhorou. O script roda o corretor de verdade e devolve número.
//
// Uso:
//   npm run aferir                          -- uma passada em tudo
//   npm run aferir -- --repeticoes 3        -- mede o ruído (recomendado)
//   npm run aferir -- --modelo gemini-3.5-flash
//   npm run aferir -- --id fraca-generica
//
// DOIS MODOS, conforme o conjunto em scripts/fixtures/redacoes-afericao.json:
//
//   Redação COM nota oficial  -> mede ACERTO (viés e erro absoluto).
//   Redação SEM nota oficial  -> mede ESTABILIDADE (o mesmo texto tira a mesma
//                                nota?) e serve de regressão quando o prompt
//                                muda. Não precisa de gabarito para isso.
//
// As três medidas NÃO são a mesma coisa, e cada uma tem conserto diferente:
//
//   VIÉS (erro com sinal) — erra sempre para o mesmo lado? +120 = infla 120
//     pontos em média. Conserta na CALIBRAGEM do prompt (ancorar com redações
//     de nota conhecida). Rodar mais vezes não resolve.
//
//   ERRO ABSOLUTO — o quanto erra, para qualquer lado.
//
//   RUÍDO — dispersão entre execuções do MESMO texto. Conserta rodando N vezes
//     e tirando a mediana. Mexer no prompt não resolve.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ARQUIVO = resolve(RAIZ, "scripts/fixtures/redacoes-afericao.json");

// --- argumentos --------------------------------------------------------------

function argumento(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`);
  return i === -1 ? padrao : process.argv[i + 1];
}

const REPETICOES = Math.max(1, Number(argumento("repeticoes", 1)));
const MODELO = argumento("modelo", null);
const SO_ID = argumento("id", null);

// O corretor lê o modelo da env quando o módulo carrega, então isto precisa
// acontecer antes do import.
if (MODELO) process.env.GEMINI_MODEL_REDACAO = MODELO;

const { corrigirRedacao } = await import("@/lib/ia/gemini");

// --- conjunto ----------------------------------------------------------------

let conjunto;
try {
  conjunto = JSON.parse(readFileSync(ARQUIVO, "utf8"));
} catch (erro) {
  console.error(`\nNão consegui ler ${ARQUIVO}\n${erro.message}`);
  process.exit(1);
}

const redacoes = (conjunto.redacoes ?? []).filter((r) => !SO_ID || r.id === SO_ID);

if (redacoes.length === 0) {
  console.error("\nNenhuma redação para aferir. Veja o campo _leia_me do arquivo de fixtures.");
  process.exit(1);
}

// --- estatística -------------------------------------------------------------

const COMPETENCIAS = [1, 2, 3, 4, 5];
const media = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const amplitude = (xs) => Math.max(...xs) - Math.min(...xs);

function mediana(xs) {
  const ord = [...xs].sort((a, b) => a - b);
  const m = Math.floor(ord.length / 2);
  return ord.length % 2 ? ord[m] : (ord[m - 1] + ord[m]) / 2;
}

function sinal(n) {
  const v = Math.round(n);
  return v > 0 ? `+${v}` : String(v);
}

async function comRetentativa(fn, tentativas = 3) {
  let ultimo;
  for (let i = 0; i < tentativas; i++) {
    try {
      return await fn();
    } catch (erro) {
      ultimo = erro;
      if (i < tentativas - 1) await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
    }
  }
  throw ultimo;
}

// --- execução ----------------------------------------------------------------

const comGabarito = redacoes.filter((r) => r.oficial).length;

console.log(`\nAferindo ${redacoes.length} redação(ões) — ${comGabarito} com nota oficial`);
console.log(`modelo: ${process.env.GEMINI_MODEL_REDACAO ?? "(padrão do código)"}`);
console.log(`repetições: ${REPETICOES}${REPETICOES === 1 ? "  (use --repeticoes 3 para medir ruído)" : ""}\n`);

const resultados = [];
const falhas = [];

for (const redacao of redacoes) {
  process.stdout.write(`  ${redacao.id.padEnd(24)} `);

  const execucoes = [];
  try {
    for (let i = 0; i < REPETICOES; i++) {
      execucoes.push(
        await comRetentativa(() =>
          corrigirRedacao(redacao.tema, redacao.texto, redacao.textoMotivador ?? "")
        )
      );
      if (REPETICOES > 1) process.stdout.write(".");
    }
  } catch (erro) {
    console.log(` FALHOU: ${erro.message}`);
    falhas.push({ id: redacao.id, motivo: erro.message });
    continue;
  }

  // Com repetições, a nota considerada é a mediana — é como o corretor rodaria
  // em produção se adotássemos mediana de N.
  const porCompetencia = COMPETENCIAS.map((numero) => {
    const notas = execucoes.map((e) => e.competencias.find((c) => c.numero === numero)?.nota ?? 0);
    const obtida = mediana(notas);
    const oficial = redacao.oficial?.[`c${numero}`] ?? null;
    return {
      numero,
      oficial,
      obtida,
      erro: oficial === null ? null : obtida - oficial,
      ruido: amplitude(notas),
    };
  });

  const totaisExecucoes = execucoes.map((e) => e.notaTotal);
  const totalObtido = mediana(totaisExecucoes);
  const totalOficial = redacao.oficial
    ? COMPETENCIAS.reduce((s, n) => s + redacao.oficial[`c${n}`], 0)
    : null;

  const r = {
    id: redacao.id,
    totalOficial,
    totalObtido,
    erro: totalOficial === null ? null : totalObtido - totalOficial,
    ruido: amplitude(totaisExecucoes),
    porCompetencia,
    anulada: Boolean(execucoes[0].zerada),
    anulacaoEsperada: Boolean(redacao.anulada),
  };
  resultados.push(r);

  const partes = [`nota ${String(totalObtido).padStart(4)}`];
  if (totalOficial !== null) {
    partes.push(`oficial ${String(totalOficial).padStart(4)}`, `erro ${sinal(r.erro).padStart(5)}`);
  }
  if (REPETICOES > 1) partes.push(`ruído ${String(r.ruido).padStart(3)}`);
  if (r.anulada) partes.push("ANULADA");
  console.log(` ${partes.join("   ")}`);
}

if (resultados.length === 0) {
  console.log("\nNenhuma correção concluída. A API do Gemini pode estar indisponível.");
  process.exit(1);
}

const linha = "=".repeat(66);

// --- acerto (só com gabarito) ------------------------------------------------

const aferidas = resultados.filter((r) => r.erro !== null);

if (aferidas.length > 0) {
  console.log(`\n${linha}\nACERTO — ${aferidas.length} redação(ões) com nota oficial\n${linha}`);
  console.log("        viés     erro absoluto");

  for (const numero of COMPETENCIAS) {
    const cs = aferidas.map((r) => r.porCompetencia.find((c) => c.numero === numero));
    const vies = media(cs.map((c) => c.erro));
    const abs = media(cs.map((c) => Math.abs(c.erro)));
    console.log(`  C${numero}  ${sinal(vies).padStart(7)}  ${String(Math.round(abs)).padStart(14)}`);
  }

  const viesTotal = media(aferidas.map((r) => r.erro));
  const absTotal = media(aferidas.map((r) => Math.abs(r.erro)));
  console.log(`\n  nota final:  viés ${sinal(viesTotal)}   erro absoluto ${Math.round(absTotal)} de 1000`);

  console.log("\n" + "-".repeat(66));
  if (Math.abs(viesTotal) > 80) {
    console.log(`O viés de ${sinal(viesTotal)} domina: o corretor erra sempre para o mesmo lado.`);
    console.log("Conserto: calibrar o prompt com redações de nota conhecida ancoradas");
    console.log("como exemplo. Rodar mais vezes NÃO resolve viés.");
  } else if (absTotal > 100) {
    console.log(`Sem viés dominante (${sinal(viesTotal)}), mas erro absoluto de ${Math.round(absTotal)} pontos.`);
    console.log("Rode com --repeticoes 3: se o ruído for alto, o conserto é mediana de N.");
  } else {
    console.log(`Erro absoluto de ${Math.round(absTotal)} pontos — dentro do que dois corretores`);
    console.log("humanos costumam divergir entre si.");
  }
} else {
  console.log(`\n${linha}\nACERTO — não medido\n${linha}`);
  console.log("Nenhuma redação do conjunto tem nota oficial, então não dá para dizer");
  console.log("se as notas acima estão certas — só se são estáveis.");
  console.log("Para medir acerto, acrescente `oficial` a algumas redações.");
  console.log("O campo _leia_me do arquivo de fixtures diz onde conseguir.");
}

// --- estabilidade (não precisa de gabarito) ----------------------------------

if (REPETICOES > 1) {
  console.log(`\n${linha}\nESTABILIDADE — ${REPETICOES} execuções do mesmo texto\n${linha}`);
  console.log("       ruído médio por competência");

  for (const numero of COMPETENCIAS) {
    const cs = resultados.map((r) => r.porCompetencia.find((c) => c.numero === numero));
    console.log(`  C${numero}  ${String(Math.round(media(cs.map((c) => c.ruido)))).padStart(7)}`);
  }

  const ruidoTotal = media(resultados.map((r) => r.ruido));
  console.log(`\n  nota final: ${Math.round(ruidoTotal)} pontos entre a maior e a menor execução`);

  console.log("\n" + "-".repeat(66));
  if (ruidoTotal > 120) {
    console.log(`Ruído de ${Math.round(ruidoTotal)} pontos é alto: o mesmo texto tira notas diferentes.`);
    console.log("Conserto: rodar N vezes e usar a mediana (custa N créditos), ou");
    console.log("mostrar faixa em vez de número cravado.");
  } else {
    console.log(`Ruído de ${Math.round(ruidoTotal)} pontos — o corretor está razoavelmente estável.`);
  }
}

// --- anulação ----------------------------------------------------------------

// Anulação é acerto/erro categórico, não distância: anular indevidamente diz a
// quem estudou que o texto vale zero.
const anulacaoErrada = resultados.filter((r) => r.anulada !== r.anulacaoEsperada);
if (anulacaoErrada.length) {
  console.log(`\n${linha}\nANULAÇÃO ERRADA em ${anulacaoErrada.length}\n${linha}`);
  for (const r of anulacaoErrada) {
    console.log(`  ${r.id} — ${r.anulada ? "anulou e não devia" : "devia ter anulado e não anulou"}`);
  }
}

if (falhas.length) {
  console.log(`\n  ${falhas.length} não corrigida(s) — API:`);
  for (const f of falhas) console.log(`    ${f.id} — ${f.motivo}`);
}

console.log("");
