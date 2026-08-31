import { NextResponse } from "next/server";
import { autenticarRequisicao } from "@/lib/auth/autenticarRequisicao";
import { lerAssinatura } from "@/lib/data/assinaturaAdmin";
import { temAcessoIa } from "@/lib/data/assinaturaCore";
import { estornarCota, lerCota, reservarCota } from "@/lib/data/usoIaAdmin";
import { conversar, ErroIa } from "@/lib/ia/gemini";
import { chatIaInputSchema } from "@/lib/validators/dominio";

// Conversa com o Agente de IA (exclusivo do plano Pro).
//
// Mesma ordem de proteção das outras rotas de IA: autenticação, plano e cota
// antes de gastar a API paga. A trava de plano é feita aqui no servidor porque
// a do dashboard é client-side e não protegeria um endpoint que custa dinheiro.

/** Quantas mensagens do histórico vão para o modelo. Teto de custo por turno. */
const JANELA_CONTEXTO = 20;

export async function POST(request: Request) {
  const usuario = await autenticarRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const assinatura = await lerAssinatura(usuario.uid);
  if (!temAcessoIa(assinatura)) {
    return NextResponse.json(
      { erro: "O Agente de IA faz parte do plano Pro.", precisaUpgrade: true },
      { status: 403 }
    );
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  const parsed = chatIaInputSchema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0]?.message ?? "dados inválidos" },
      { status: 400 }
    );
  }

  // Conversa longa não pode crescer o custo sem limite: só as últimas mensagens
  // viram contexto. O histórico completo continua salvo e visível na tela.
  const historico = parsed.data.mensagens.slice(-JANELA_CONTEXTO);

  // A última mensagem precisa ser do usuário — senão o modelo não tem o que responder.
  if (historico[historico.length - 1]?.papel !== "usuario") {
    return NextResponse.json(
      { erro: "a última mensagem precisa ser do usuário" },
      { status: 400 }
    );
  }

  const reserva = await reservarCota(usuario.uid);
  if (!reserva.ok) {
    return NextResponse.json(
      {
        erro: `Você já usou as ${reserva.limite} mensagens de IA deste mês. A cota renova no dia 1º.`,
        cotaEsgotada: true,
      },
      { status: 429 }
    );
  }

  try {
    const resultado = await conversar(historico, parsed.data.materias);
    return NextResponse.json({
      ok: true,
      resposta: resultado.resposta,
      tarefas: resultado.tarefas ?? [],
      restantes: reserva.restantes,
    });
  } catch (erro) {
    // A falha não foi do usuário — devolve a cota.
    await estornarCota(usuario.uid);
    const mensagem =
      erro instanceof ErroIa ? erro.message : "Não foi possível responder agora.";
    console.error("[ia/chat] falha:", erro);
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}

// A tela usa para saber se mostra o chat ou o convite para o plano Pro.
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
