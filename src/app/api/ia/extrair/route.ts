import { NextResponse } from "next/server";
import { autenticarRequisicao } from "@/lib/auth/autenticarRequisicao";
import { lerAssinatura } from "@/lib/data/assinaturaAdmin";
import { temAcessoIa } from "@/lib/data/assinaturaCore";
import { estornarCota, lerCota, reservarCota } from "@/lib/data/usoIaAdmin";
import { ErroIa, extrairTarefas } from "@/lib/ia/gemini";
import { extrairIaInputSchema } from "@/lib/validators/studyflow";

// Agente de IA (exclusivo do plano Pro).
//
// A ordem aqui é deliberada: tudo que é barato e pode reprovar o pedido roda
// ANTES de gastar a API paga — autenticação, plano, cota e, só então, o modelo.
// A trava de plano é feita no servidor porque a trava do dashboard é client-side
// e não protegeria um endpoint que custa dinheiro por chamada.

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

  const parsed = extrairIaInputSchema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0]?.message ?? "dados inválidos" },
      { status: 400 }
    );
  }

  // Reserva antes de chamar o modelo: sob uso simultâneo, contar depois deixaria
  // furar o teto de custo.
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
    const itens = await extrairTarefas(parsed.data.texto);
    return NextResponse.json({ ok: true, itens, restantes: reserva.restantes });
  } catch (erro) {
    // A falha não foi do usuário — devolve a cota.
    await estornarCota(usuario.uid);
    const mensagem =
      erro instanceof ErroIa ? erro.message : "Não foi possível analisar o texto agora.";
    console.error("[ia/extrair] falha:", erro);
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}

// Usado pela tela para mostrar quantas análises ainda restam no mês.
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
