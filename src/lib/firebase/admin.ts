import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Valores de service account em variáveis de ambiente costumam vir "sujos"
// quando copiados direto do JSON (com espaços, aspas envolventes e vírgula
// final). Parsers de .env divergem em como tratam isso — alguns limpam, outros
// não. Estas funções normalizam para funcionar em next dev, scripts e Netlify.
function limparEnv(bruto: string | undefined): string | undefined {
  if (!bruto) return bruto;
  return bruto
    .trim()
    .replace(/,+\s*$/, "") // vírgula final (ex.: "valor",)
    .replace(/^\s*["']/, "") // aspa de abertura
    .replace(/["']\s*$/, ""); // aspa de fechamento
}

function normalizarPrivateKey(bruto: string | undefined): string | undefined {
  const limpa = limparEnv(bruto);
  // Converte "\n" literal em quebras de linha reais (no-op se já forem reais).
  return limpa?.replace(/\\n/g, "\n");
}

/**
 * Server-only Firebase Admin SDK. Never import this from a Client Component.
 * Requires FIREBASE_ADMIN_* env vars pointing at a service account — see .env.example.
 * The service account JSON itself must never be committed; store the values in
 * .env.local (git-ignored) or in the hosting provider's secret manager.
 */
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = limparEnv(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = limparEnv(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = normalizarPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin nao configurado: defina FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY em .env.local"
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
