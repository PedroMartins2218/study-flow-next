// Migra dados do modelo antigo (por e-mail) para o novo modelo (por uid).
//
// Modelo antigo (dashboard.html):
//   usuarios/{email}       -> { materias: [], atividades: [], trabalhos: [], provas: [], sessoes: [] }
//   assinaturas/{email}    -> { status, expiracao, ... }
//
// Modelo novo (study-flow-next):
//   usuarios/{uid}/materias/{id}
//   usuarios/{uid}/atividades/{id}
//   usuarios/{uid}/trabalhos/{id}
//   usuarios/{uid}/provas/{id}
//   usuarios/{uid}/sessoes/{id}
//   assinaturas/{uid}
//
// Uso:
//   node --env-file=.env.local scripts/migrar-dados-legado.mjs --dry-run
//   node --env-file=.env.local scripts/migrar-dados-legado.mjs
//
// Flags:
//   --dry-run   não escreve nada, só mostra o que seria feito
//   --forcar    remigra usuários que já têm o campo migradoEm marcado
//
// Nunca apaga os documentos antigos automaticamente — isso é uma decisão
// manual, feita depois de confirmar que os dados novos estão corretos.

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const dryRun = process.argv.includes("--dry-run");
const forcar = process.argv.includes("--forcar");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Faltam variáveis FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY.\n" +
      "Rode com: node --env-file=.env.local scripts/migrar-dados-legado.mjs"
  );
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app);

const COLECOES_ARRAY = ["materias", "atividades", "trabalhos", "provas", "sessoes"];

async function listarTodosUsuarios() {
  const usuarios = [];
  let pageToken;
  do {
    const pagina = await auth.listUsers(1000, pageToken);
    usuarios.push(...pagina.users);
    pageToken = pagina.pageToken;
  } while (pageToken);
  return usuarios;
}

async function migrarUsuario(user) {
  const { uid, email } = user;
  if (!email) return { uid, status: "sem-email" };

  const novoRef = db.collection("usuarios").doc(uid);
  const novoSnap = await novoRef.get();
  if (novoSnap.exists && novoSnap.data().migradoEm && !forcar) {
    return { uid, email, status: "ja-migrado" };
  }

  const legadoRef = db.collection("usuarios").doc(email);
  const legadoSnap = await legadoRef.get();

  if (!legadoSnap.exists) {
    return { uid, email, status: "sem-dados-legados" };
  }

  const dados = legadoSnap.data();
  let totalItens = 0;

  if (!dryRun) {
    await novoRef.set(
      { perfil: { email }, migradoEm: FieldValue.serverTimestamp() },
      { merge: true }
    );
  }

  for (const colecao of COLECOES_ARRAY) {
    const itens = Array.isArray(dados[colecao]) ? dados[colecao] : [];
    totalItens += itens.length;
    if (dryRun) continue;

    const destino = novoRef.collection(colecao);
    let batch = db.batch();
    let contadorLote = 0;

    for (const item of itens) {
      const docRef = destino.doc();
      batch.set(docRef, { ...item, criadoEm: FieldValue.serverTimestamp() });
      contadorLote += 1;
      if (contadorLote === 400) {
        await batch.commit();
        batch = db.batch();
        contadorLote = 0;
      }
    }
    if (contadorLote > 0) await batch.commit();
  }

  const assinaturaLegadoSnap = await db.collection("assinaturas").doc(email).get();
  if (assinaturaLegadoSnap.exists && !dryRun) {
    await db
      .collection("assinaturas")
      .doc(uid)
      .set(assinaturaLegadoSnap.data(), { merge: true });
  }

  return {
    uid,
    email,
    status: "migrado",
    itens: totalItens,
    assinatura: assinaturaLegadoSnap.exists,
  };
}

async function main() {
  console.log(`Modo: ${dryRun ? "DRY-RUN (nada será escrito)" : "EXECUÇÃO REAL"}`);
  const usuarios = await listarTodosUsuarios();
  console.log(`Usuários no Firebase Auth: ${usuarios.length}`);

  const resultados = [];
  for (const user of usuarios) {
    try {
      resultados.push(await migrarUsuario(user));
    } catch (erro) {
      resultados.push({ uid: user.uid, email: user.email, status: "erro", erro: String(erro) });
    }
  }

  console.table(
    resultados.map((r) => ({
      email: r.email ?? "-",
      status: r.status,
      itens: r.itens ?? "-",
      assinatura: r.assinatura ?? "-",
    }))
  );

  const migrados = resultados.filter((r) => r.status === "migrado").length;
  const erros = resultados.filter((r) => r.status === "erro");
  console.log(`\nMigrados agora: ${migrados}`);
  if (erros.length) {
    console.error(`Erros: ${erros.length}`, erros);
    process.exitCode = 1;
  }
}

main();
