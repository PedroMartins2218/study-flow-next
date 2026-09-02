import { NextResponse } from "next/server";
import { autenticarRequisicao } from "@/lib/auth/autenticarRequisicao";
import {
  aplicarPendenteSeExistir,
  existePendente,
  lerAssinatura,
} from "@/lib/data/assinaturaAdmin";
import { assinaturaEstaAtiva } from "@/lib/data/assinaturaCore";

// Fecha o fluxo "pagou antes de ter conta": o webhook guardou o acesso em
// assinaturasPendentes pelo e-mail da compra, e aqui ele vira a assinatura do
// uid recém-criado. Chamada no cadastro/login e pelo botão "Já paguei".
//
// ⚠️ A compra é ligada à conta SÓ pelo e-mail, e o Firebase deixa qualquer um
// criar conta com qualquer endereço, sem provar que é seu. Sem a confirmação
// abaixo, quem soubesse o e-mail de um comprador poderia criar a conta antes
// dele e receber o acesso pago. Por isso o e-mail confirmado é exigido —
// mas só aqui, no caminho do dinheiro: o uso normal do app não muda.
export async function POST(request: Request) {
  const usuario = await autenticarRequisicao(request);
  if (!usuario) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }
  if (!usuario.email) {
    return NextResponse.json({ erro: "conta sem e-mail" }, { status: 400 });
  }

  try {
    // Só faz sentido cobrar a confirmação quando há mesmo uma compra em jogo:
    // do contrário toda chamada de rotina no login viraria um erro à toa.
    if (!usuario.emailVerificado && (await existePendente(usuario.email))) {
      return NextResponse.json(
        {
          erro:
            "Encontramos sua compra! Confirme seu e-mail para liberar o acesso — " +
            "enviamos um link para " +
            usuario.email +
            ".",
          precisaVerificarEmail: true,
        },
        { status: 403 }
      );
    }

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
