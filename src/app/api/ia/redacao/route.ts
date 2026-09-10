import { NextResponse } from "next/server";
import { autenticarRequisicao } from "@/lib/auth/autenticarRequisicao";
import { lerAssinatura } from "@/lib/data/assinaturaAdmin";
import { temAcessoIa } from "@/lib/data/assinaturaCore";
import { lerTextosAnteriores } from "@/lib/data/redacoesAdmin";
import { estornarCota, lerCota, reservarCota } from "@/lib/data/usoIaAdmin";
import { corrigirRedacao, ErroIa } from "@/lib/ia/gemini";
import { compararComFontes, type FonteComparacao } from "@/lib/redacao/similaridade";
import { corrigirRedacaoInputSchema } from "@/lib/validators/dominio";

// Correção de redação pela matriz do ENEM (exclusivo do plano Pro).
//
// Mesma ordem das outras rotas de IA: autenticação, plano e cota antes de
// gastar a API paga. A trava de plano é feita aqui no servidor porque a do
// dashboard é client-side e não protegeria um endpoint que custa por chamada.
//
// A verificação de cópia roda em paralelo com a correção e NÃO usa IA: é
// sobreposição de n-gramas contra os textos motivadores e as redações
// anteriores do próprio aluno. Um modelo de linguagem não tem acervo para
// comparar e, se perguntassem a ele, devolveria um percentual inventado.

export async function POST(request: Request) {
  const usuario = await autenticarRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const assinatura = await lerAssinatura(usuario.uid);
  if (!temAcessoIa(assinatura)) {
    return NextResponse.json(
      { erro: "A correção de redação faz parte do plano Pro.", precisaUpgrade: true },
      { status: 403 }
    );
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  const parsed = corrigirRedacaoInputSchema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0]?.message ?? "dados inválidos" },
      { status: 400 }
    );
  }

  const { tema, texto, textoMotivador } = parsed.data;

  const reserva = await reservarCota(usuario.uid);
  if (!reserva.ok) {
    return NextResponse.json(
      {
        erro: `Você já usou as ${reserva.limite} análises de IA deste mês. A cota renova no dia 1º.`,
        cotaEsgotada: true,
      },
      { status: 429 }
    );
  }

  try {
    // As duas análises são independentes: a de cópia é aritmética local e sai
    // rápido, a do modelo é a que demora. Rodar em paralelo faz a checagem de
    // plágio sair de graça no tempo de resposta.
    const [correcao, plagio] = await Promise.all([
      corrigirRedacao(tema, texto, textoMotivador),
      verificarCopia(usuario.uid, texto, textoMotivador),
    ]);

    return NextResponse.json({ ok: true, correcao, plagio, restantes: reserva.restantes });
  } catch (erro) {
    // A falha não foi do usuário — devolve a cota.
    await estornarCota(usuario.uid);
    const mensagem =
      erro instanceof ErroIa ? erro.message : "Não foi possível corrigir a redação agora.";
    console.error("[ia/redacao] falha:", erro);
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}

/**
 * Monta as fontes de comparação e mede a sobreposição.
 *
 * O tema não entra como fonte de propósito: retomar o enunciado na introdução é
 * esperado no ENEM, e acusar isso seria falso positivo garantido.
 */
async function verificarCopia(uid: string, texto: string, textoMotivador: string) {
  const fontes: FonteComparacao[] = [];

  if (textoMotivador.trim()) {
    fontes.push({ rotulo: "Texto motivador", conteudo: textoMotivador });
  }

  // Uma falha ao ler o histórico não pode derrubar a correção inteira: nesse
  // caso o índice sai apenas com o que temos (os textos motivadores).
  try {
    fontes.push(...(await lerTextosAnteriores(uid)));
  } catch (erro) {
    console.error("[ia/redacao] falha ao ler redações anteriores:", erro);
  }

  return compararComFontes(texto, fontes);
}

export async function GET(request: Request) {
  const usuario = await autenticarRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const assinatura = await lerAssinatura(usuario.uid);
  if (!temAcessoIa(assinatura)) {
    return NextResponse.json({ temAcesso: false });
  }

  const cota = await lerCota(usuario.uid);
  return NextResponse.json({ temAcesso: true, ...cota });
}
