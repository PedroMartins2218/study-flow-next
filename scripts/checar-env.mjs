// Confere se o .env.local está completo e bem formado, SEM imprimir nenhum
// valor secreto. Serve tanto para a máquina local quanto para conferir antes
// de configurar as mesmas variáveis no Netlify.
//
// Uso:  npm run checar-env

const GRUPOS = [
  {
    nome: "Firebase — navegador",
    obrigatorio: true,
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
    nome: "Firebase — servidor (libera acesso, grava assinatura)",
    obrigatorio: true,
    chaves: [
      "FIREBASE_ADMIN_PROJECT_ID",
      "FIREBASE_ADMIN_CLIENT_EMAIL",
      "FIREBASE_ADMIN_PRIVATE_KEY",
    ],
  },
  {
    nome: "Kirvano — pagamento",
    obrigatorio: true,
    chaves: [
      "NEXT_PUBLIC_KIRVANO_CHECKOUT_BASE_URL",
      "NEXT_PUBLIC_KIRVANO_CHECKOUT_PRO_URL",
      "KIRVANO_OFERTA_BASE_ID",
      "KIRVANO_OFERTA_PRO_ID",
      "KIRVANO_WEBHOOK_TOKEN",
    ],
  },
  {
    nome: "Agente de IA (plano Pro)",
    obrigatorio: true,
    chaves: ["GEMINI_API_KEY", "GEMINI_MODEL", "IA_LIMITE_PRO"],
  },
  {
    nome: "Painel administrativo",
    obrigatorio: false,
    chaves: ["ADMIN_SECRET"],
  },
];

// Problemas que já aconteceram de verdade neste projeto.
function problemasDe(chave, valor) {
  const avisos = [];
  const bruto = valor ?? "";

  if (/^["']|["']$/.test(bruto.trim())) {
    avisos.push("está entre aspas — tire as aspas");
  }
  if (/,\s*$/.test(bruto)) {
    avisos.push("termina com vírgula — tire a vírgula");
  }
  if (bruto !== bruto.trim()) {
    avisos.push("tem espaço sobrando no começo ou no fim");
  }
  if (chave === "FIREBASE_ADMIN_PRIVATE_KEY") {
    if (!bruto.includes("BEGIN PRIVATE KEY")) {
      avisos.push("não parece uma chave privada (falta o cabeçalho BEGIN PRIVATE KEY)");
    }
    if (bruto.includes("\\\\n")) {
      avisos.push("tem barras duplicadas (\\\\n) — o código corrige, mas o certo é \\n");
    }
  }
  // O Google usa dois formatos de chave: o antigo "AIza..." e o novo "AQ.".
  // Aceitar só o antigo dava alarme falso numa chave boa.
  if (chave === "GEMINI_API_KEY" && bruto && !/^(AIza|AQ\.)/.test(bruto)) {
    avisos.push("não parece uma chave do Google (esperado começar com AIza ou AQ.)");
  }
  if (chave.endsWith("_CHECKOUT_BASE_URL") || chave.endsWith("_CHECKOUT_PRO_URL")) {
    if (bruto && !/^https?:\/\//.test(bruto)) {
      avisos.push("não parece um link (precisa começar com https://)");
    }
  }
  if (chave === "KIRVANO_WEBHOOK_TOKEN" && bruto && bruto.length < 16) {
    avisos.push("token muito curto — gere um mais longo");
  }
  return avisos;
}

let faltando = 0;
let comProblema = 0;

console.log("\nConferindo o .env.local (nenhum valor é exibido)\n");

for (const grupo of GRUPOS) {
  console.log(`  ${grupo.nome}`);
  for (const chave of grupo.chaves) {
    const valor = process.env[chave];
    const preenchida = Boolean(valor && valor.trim());

    if (!preenchida) {
      if (grupo.obrigatorio) faltando++;
      console.log(`    ${grupo.obrigatorio ? "FALTA " : "vazia "} ${chave}`);
      continue;
    }

    const avisos = problemasDe(chave, valor);
    if (avisos.length) {
      comProblema++;
      console.log(`    ATENÇÃO ${chave} — ${avisos.join("; ")}`);
    } else {
      console.log(`    ok     ${chave}`);
    }
  }
  console.log("");
}

// Erro grave: segredo exposto ao navegador.
const SEGREDOS = ["GEMINI_API_KEY", "KIRVANO_WEBHOOK_TOKEN", "FIREBASE_ADMIN_PRIVATE_KEY", "ADMIN_SECRET"];
const expostos = SEGREDOS.filter((c) => process.env[`NEXT_PUBLIC_${c}`]);
if (expostos.length) {
  console.log("  PERIGO: estas variáveis secretas estão com prefixo NEXT_PUBLIC_ e");
  console.log("          seriam enviadas ao navegador do usuário:", expostos.join(", "));
  comProblema += expostos.length;
  console.log("");
}

if (faltando === 0 && comProblema === 0) {
  console.log("  Tudo certo — pode avisar que está pronto.\n");
  process.exit(0);
}

console.log(
  `  Resumo: ${faltando} obrigatória(s) faltando, ${comProblema} com problema de formato.`
);
console.log("  Arquivo: .env.local (na pasta study-flow-next-repo)\n");
process.exit(1);
