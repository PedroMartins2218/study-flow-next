import { NextResponse } from "next/server";
import { kirvanoWebhookSchema } from "@/lib/validators/dominio";
import { processarEvento, tokenValido } from "@/lib/data/kirvanoWebhook";

// Webhook de pagamento da Kirvano — é o que libera acesso sem intervenção
// manual. A lógica fica em lib/data/kirvanoWebhook.ts; aqui só entra/sai HTTP.
//
// Códigos de resposta, de propósito:
//  - 401  token inválido (não processa);
//  - 200  processado OU ignorado OU reentrega — nada a reenviar;
//  - 500  falha nossa (Firestore fora, por exemplo) — aí SIM queremos que a
//         Kirvano reenvie o evento mais tarde.

export async function POST(request: Request) {
  if (!tokenValido(request)) {
    console.error("[kirvano] token inválido — evento recusado.");
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  const parsed = kirvanoWebhookSchema.safeParse(corpo);
  if (!parsed.success) {
    // Reenviar não resolve payload fora do formato: responde 200 e loga o
    // corpo para ajustarmos o mapeamento.
    console.error(
      "[kirvano] payload não reconhecido:",
      parsed.error.issues.map((i) => i.message).join("; "),
      JSON.stringify(corpo).slice(0, 2000)
    );
    return NextResponse.json({ ok: true, ignorado: "payload não reconhecido" });
  }

  try {
    const resultado = await processarEvento(parsed.data, corpo);
    console.log(
      `[kirvano] ${parsed.data.event}: ${resultado.detalhe}` +
        (resultado.aplicado ? "" : " (sem efeito)")
    );
    return NextResponse.json({ ok: true, ...resultado });
  } catch (erro) {
    console.error("[kirvano] falha ao processar evento:", erro);
    return NextResponse.json({ erro: "falha ao processar" }, { status: 500 });
  }
}
