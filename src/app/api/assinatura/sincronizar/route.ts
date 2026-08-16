import { NextResponse } from "next/server";
import { autenticarRequisicao } from "@/lib/auth/autenticarRequisicao";
import { aplicarPendenteSeExistir, lerAssinatura } from "@/lib/data/assinaturaAdmin";
import { assinaturaEstaAtiva } from "@/lib/data/assinaturaCore";

// Fecha o fluxo "pagou antes de ter conta": o webhook guardou o acesso em
// assinaturasPendentes pelo e-mail da compra, e aqui ele vira a assinatura do
// uid recém-criado. Chamada no cadastro/login e pelo botão "Já paguei".
export async function POST(request: Request) {
  const usuario = await autenticarRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }
  if (!usuario.email) {
    return NextResponse.json({ erro: "conta sem e-mail" }, { status: 400 });
  }

  try {
    const aplicou = await aplicarPendenteSeExistir(usuario.uid, usuario.email);
    const assinatura = await lerAssinatura(usuario.uid);
    return NextResponse.json({
      ok: true,
      aplicou,
      ativa: assinaturaEstaAtiva(assinatura),
    });
  } catch (erro) {
    console.error("[assinatura/sincronizar] falha:", erro);
    return NextResponse.json(
      { erro: "não foi possível verificar sua compra agora" },
      { status: 500 }
    );
  }
}
