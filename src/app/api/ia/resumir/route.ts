import { NextResponse } from "next/server";
import { autenticarRequisicao } from "@/lib/auth/autenticarRequisicao";
import { lerAssinatura } from "@/lib/data/assinaturaAdmin";
import { temAcessoIa } from "@/lib/data/assinaturaCore";
import { estornarCota, reservarCota } from "@/lib/data/usoIaAdmin";
import { ErroIa, resumirTexto } from "@/lib/ia/gemini";
import { resumirIaInputSchema } from "@/lib/validators/studyflow";

// Resumo com IA (exclusivo do plano Pro).
//
// Mesma ordem da rota de extração, pelo mesmo motivo: tudo que é barato e pode
// reprovar o pedido roda ANTES de gastar a API paga — autenticação, plano,
// cota e, só então, o modelo. A trava de plano é feita no servidor porque a do
// dashboard é client-side e não protegeria um endpoint que custa por chamada.

export async function POST(request: Request) {
  const usuario = await autenticarRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  const assinatura = await lerAssinatura(usuario.uid);
  if (!temAcessoIa(assinatura)) {
    return NextResponse.json(
      { erro: "Os resumos com IA fazem parte do plano Pro.", precisaUpgrade: true },
      { status: 403 }
    );
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  const parsed = resumirIaInputSchema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0]?.message ?? "dados inválidos" },
      { status: 400 }
    );
  }

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
    const resumo = await resumirTexto(parsed.data.texto, parsed.data.materia);
    return NextResponse.json({ ok: true, resumo, restantes: reserva.restantes });
  } catch (erro) {
    // A falha não foi do usuário — devolve a cota.
    await estornarCota(usuario.uid);
    const mensagem =
      erro instanceof ErroIa ? erro.message : "Não foi possível resumir o texto agora.";
    console.error("[ia/resumir] falha:", erro);
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}
