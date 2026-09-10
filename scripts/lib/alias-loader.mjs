// Permite que scripts em Node importem o código TypeScript de `src/` com o
// alias "@/" do tsconfig, sem passar pelo bundler do Next.
//
// Duas coisas precisam ser resolvidas para isso funcionar:
//
//  1. O alias "@/..." — o tsconfig sabe traduzir, o Node não.
//  2. O pacote "server-only" — fora do bundler ele cai na variante de cliente,
//     que lança por definição. No build do servidor ele é um no-op, e é isso
//     que reproduzimos aqui.
//
// Uso:
//   node --import ./scripts/lib/alias-loader.mjs scripts/meu-script.mjs
//
// O Node 22+ executa TypeScript direto (apagando os tipos), então dá para
// importar `src/lib/...ts` sem etapa de build.

import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SRC = resolve(RAIZ, "src");

// A ordem importa: "" primeiro cobre quem já escreveu a extensão.
const EXTENSOES = ["", ".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx"];

const MODULO_VAZIO = "data:text/javascript,export{}";

registerHooks({
  resolve(especificador, contexto, proximo) {
    if (especificador === "server-only") {
      return { url: MODULO_VAZIO, shortCircuit: true };
    }

    if (especificador.startsWith("@/")) {
      // Preserva a query string (?v=1), que é como um script força o Node a
      // reavaliar o módulo em vez de devolver o do cache.
      const corte = especificador.indexOf("?");
      const query = corte === -1 ? "" : especificador.slice(corte);
      const caminho = (corte === -1 ? especificador : especificador.slice(0, corte)).slice(2);

      for (const extensao of EXTENSOES) {
        const tentativa = resolve(SRC, caminho + extensao);
        if (existsSync(tentativa)) {
          return { url: pathToFileURL(tentativa).href + query, shortCircuit: true };
        }
      }

      throw new Error(`alias não resolvido: ${especificador}`);
    }

    return proximo(especificador, contexto);
  },
});
