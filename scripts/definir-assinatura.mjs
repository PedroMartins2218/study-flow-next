// Ativa/desativa manualmente a assinatura de um usuário, enquanto o webhook
// da Kirvano não está ligado (ou pra corrigir um caso pontual depois).
//
// Uso:
//   node --env-file=.env.local scripts/definir-assinatura.mjs <email> ativo [YYYY-MM-DD] [plano]
//   node --env-file=.env.local scripts/definir-assinatura.mjs <email> inativo

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const [, , email, status, expiracao, plano] = process.argv;

if (!email || !status || !["ativo", "inativo", "trial"].includes(status)) {
  console.error(
    "Uso: node --env-file=.env.local scripts/definir-assinatura.mjs <email> <ativo|inativo|trial> [expiracao YYYY-MM-DD] [plano]"
  );
  process.exit(1);
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Faltam variáveis FIREBASE_ADMIN_*. Rode com: node --env-file=.env.local scripts/definir-assinatura.mjs ..."
  );
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  const usuario = await auth.getUserByEmail(email);
  const dados = { status };
  if (expiracao) dados.expiracao = expiracao;
  if (plano) dados.plano = plano;

  await db.collection("assinaturas").doc(usuario.uid).set(dados, { merge: true });
  console.log(`Assinatura de ${email} (uid ${usuario.uid}) definida como:`, dados);
}

main().catch((erro) => {
  console.error("Erro:", erro);
  process.exit(1);
});
