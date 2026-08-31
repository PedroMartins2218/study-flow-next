// Ativa/desativa manualmente a assinatura de um usuário — para corrigir um
// caso pontual ou liberar acesso sem passar pelo checkout.
//
// Uso:
//   npm run assinatura -- <email> <ativo|inativo|trial> [tier] [YYYY-MM-DD] [plano]
//
// Exemplos:
//   npm run assinatura -- alguem@email.com ativo pro
//   npm run assinatura -- alguem@email.com ativo base 2026-12-31
//   npm run assinatura -- alguem@email.com inativo
//
// O `tier` é o que libera ou bloqueia o Agente de IA (só "pro" libera).

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const [, , emailBruto, status, tier, expiracaoArg, planoArg] = process.argv;

const STATUS_VALIDOS = ["ativo", "inativo", "trial", "inadimplente", "cancelado", "expirado"];
const TIERS_VALIDOS = ["base", "pro"];

function uso(mensagem) {
  console.error(`\n${mensagem}\n`);
  console.error("Uso: npm run assinatura -- <email> <status> [tier] [expiracao] [plano]");
  console.error(`  status: ${STATUS_VALIDOS.join(" | ")}`);
  console.error(`  tier  : ${TIERS_VALIDOS.join(" | ")}  (só 'pro' libera o Agente de IA)`);
  process.exit(1);
}

if (!emailBruto || !status) uso("Informe pelo menos o e-mail e o status.");
if (!STATUS_VALIDOS.includes(status)) uso(`Status inválido: ${status}`);
if (tier && !TIERS_VALIDOS.includes(tier)) uso(`Tier inválido: ${tier}`);

// O Firebase guarda e-mails em minúsculas; sem normalizar, "Fulano@x.com"
// não encontra a conta.
const email = emailBruto.trim().toLowerCase();

const limpar = (b) =>
  b?.trim().replace(/,+\s*$/, "").replace(/^\s*["']/, "").replace(/["']\s*$/, "");

const projectId = limpar(process.env.FIREBASE_ADMIN_PROJECT_ID);
const clientEmail = limpar(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
// Aceita "\\n" e "\n" — a chave costuma chegar com escape a mais.
const privateKey = limpar(process.env.FIREBASE_ADMIN_PRIVATE_KEY)
  ?.replace(/\\\\n/g, "\n")
  .replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Faltam variáveis FIREBASE_ADMIN_*. Rode com: npm run assinatura -- ...");
  process.exit(1);
}

// Data de hoje em Brasília (usar UTC viraria o dia 3h mais cedo).
function hojeISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function somarUmMes(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const alvoAno = mes === 12 ? ano + 1 : ano;
  const alvoMes = mes === 12 ? 1 : mes + 1;
  const ultimoDia = new Date(Date.UTC(alvoAno, alvoMes, 0)).getUTCDate();
  const alvoDia = Math.min(dia, ultimoDia);
  return `${alvoAno}-${String(alvoMes).padStart(2, "0")}-${String(alvoDia).padStart(2, "0")}`;
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  const usuario = await auth.getUserByEmail(email);

  const dados = { status, atualizadoEm: FieldValue.serverTimestamp() };
  if (tier) dados.tier = tier;

  // Sem data informada, um acesso ativo vale por um mês.
  if (expiracaoArg) dados.expiracao = expiracaoArg;
  else if (status === "ativo") dados.expiracao = somarUmMes(hojeISO());

  if (planoArg) dados.plano = planoArg;
  else if (tier) dados.plano = tier === "pro" ? "Nexo Study Pro" : "Nexo Study Base";

  dados.fonte = "manual";

  await db.collection("assinaturas").doc(usuario.uid).set(dados, { merge: true });

  // `atualizadoEm` é um sentinel do servidor (não tem valor legível aqui),
  // então fica de fora do que imprimimos no terminal.
  const visivel = { ...dados };
  delete visivel.atualizadoEm;
  console.log(`\nAssinatura de ${email} atualizada (uid ${usuario.uid}):`);
  for (const [k, v] of Object.entries(visivel)) console.log(`   ${k.padEnd(10)} ${v}`);
  console.log(
    tier === "pro"
      ? "\nAgente de IA liberado para esta conta.\n"
      : "\nAgente de IA NÃO liberado (só o tier 'pro' libera).\n"
  );
}

main().catch((erro) => {
  console.error("Erro:", erro.message ?? erro);
  process.exit(1);
});
