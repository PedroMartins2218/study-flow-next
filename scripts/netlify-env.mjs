// Gera os comandos `netlify env:set` já preenchidos com os valores do
// .env.local, prontos para colar no terminal.
//
// Existe por dois motivos:
//  1. o `netlify env:import` corrompe aspas (já nos custou tempo), então a
//     forma segura é uma variável por vez, com --force;
//  2. os valores ficam só no .env.local (não versionado) — este script não
//     guarda segredo nenhum, apenas lê na hora.
//
// Uso:  npm run netlify-env
//       npm run netlify-env -- --cakto     (só as da Cakto)

const SOMENTE_CAKTO = process.argv.includes("--cakto");

const GRUPOS = [
  {
    nome: "Firebase — navegador",
    cakto: false,
    chaves: [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ],
  },
  {
    nome: "Firebase — servidor",
    cakto: false,
    chaves: [
      "FIREBASE_ADMIN_PROJECT_ID",
      "FIREBASE_ADMIN_CLIENT_EMAIL",
      "FIREBASE_ADMIN_PRIVATE_KEY",
    ],
  },
  {
    nome: "Cakto — pagamento",
    cakto: true,
    chaves: [
      "NEXT_PUBLIC_CAKTO_CHECKOUT_BASE_URL",
      "NEXT_PUBLIC_CAKTO_CHECKOUT_PRO_URL",
      "CAKTO_OFERTA_BASE_ID",
      "CAKTO_OFERTA_PRO_ID",
      "CAKTO_OFERTA_VITALICIO_ID",
      "CAKTO_WEBHOOK_SECRET",
    ],
  },
  {
    nome: "Agente de IA",
    cakto: false,
    chaves: ["GEMINI_API_KEY", "GEMINI_MODEL", "IA_LIMITE_PRO"],
  },
  {
    nome: "Administrativo",
    cakto: false,
    chaves: ["ADMIN_SECRET"],
  },
];

// Variáveis que ficaram órfãs quando trocamos de gateway. O código não lê
// nenhuma delas — deixá-las no painel só confunde quem for conferir depois.
const PARA_APAGAR = [
  "NEXT_PUBLIC_KIRVANO_CHECKOUT_BASE_URL",
  "NEXT_PUBLIC_KIRVANO_CHECKOUT_PRO_URL",
  "KIRVANO_OFERTA_BASE_ID",
  "KIRVANO_OFERTA_PRO_ID",
  "KIRVANO_WEBHOOK_TOKEN",
];

// A chave privada tem quebras de linha reais; no terminal ela precisa ir com
// \n escapado, senão o shell corta o comando na primeira linha.
function paraLinhaDeComando(valor) {
  return valor.replace(/\r/g, "").replace(/\n/g, "\\n").replace(/"/g, '\\"');
}

const grupos = GRUPOS.filter((g) => !SOMENTE_CAKTO || g.cakto);
const faltando = [];

console.log("\n# Rode `netlify link` dentro do repo antes, se ainda não estiver ligado.\n");

if (!SOMENTE_CAKTO) {
  console.log("# ── Apagar as variáveis do gateway antigo ──");
  for (const chave of PARA_APAGAR) {
    console.log(`netlify env:unset ${chave}`);
  }
  console.log("");
}

for (const grupo of grupos) {
  console.log(`# ── ${grupo.nome} ──`);
  for (const chave of grupo.chaves) {
    const valor = (process.env[chave] ?? "").trim();
    if (!valor) {
      faltando.push(chave);
      console.log(`# (vazia no .env.local, pulando)  ${chave}`);
      continue;
    }
    console.log(`netlify env:set ${chave} "${paraLinhaDeComando(valor)}" --force`);
  }
  console.log("");
}

console.log("# ── Depois de cadastrar ──");
console.log("# netlify env:list        confere o que ficou no painel");
console.log("#");
console.log("# As duas NEXT_PUBLIC_CAKTO_CHECKOUT_* são embutidas no build:");
console.log("# cadastrar depois do deploy NÃO resolve, exige um rebuild.");

if (faltando.length) {
  console.log(`\n# Atenção: ${faltando.length} variável(is) vazia(s) no .env.local:`);
  console.log("# " + faltando.join(", "));
}

console.log("");
