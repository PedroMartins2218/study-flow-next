import { NextResponse } from "next/server";
import { caktoWebhookSchema } from "@/lib/validators/dominio";
import { processarEvento, segredoValido } from "@/lib/data/caktoWebhook";

// Webhook de pagamento da Cakto — é o que libera acesso sem intervenção
// manual. A lógica fica em lib/data/caktoWebhook.ts; aqui só entra e sai HTTP.
//
// ATENÇÃO À ORDEM: a Cakto manda o segredo DENTRO do corpo (não há header de
// assinatura nem HMAC), então é preciso ler e validar o JSON antes de
// autenticar — o contrário do gateway anterior.
//
// Códigos de resposta, de propósito:
//  - 401  segredo inválido (não processa);
//  - 200  processado OU ignorado OU reentrega — nada a reenviar;
//  - 500  falha nossa (Firestore fora, por exemplo) — aí SIM queremos que a
//         Cakto reenvie o evento mais tarde.
//
// A Cakto desiste após 5 tentativas (5s, 1min, 2,5min, 6min, 30min) e corta em
// 8 segundos de espera, contando a reentrega mesmo se tivermos processado.
// Por isso o processamento aqui é curto e a idempotência é obrigatória.

export async function POST(request: Request) {
  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  const parsed = caktoWebhookSchema.safeParse(corpo);
  if (!parsed.success) {
    // Reenviar não resolve payload fora do formato: responde 200 e loga o
    // corpo para ajustarmos o mapeamento.
    console.error(
      "[cakto] payload não reconhecido:",
      parsed.error.issues.map((i) => i.message).join("; "),
      JSON.stringify(corpo).slice(0, 2000)
    );
    return NextResponse.json({ ok: true, ignorado: "payload não reconhecido" });
  }

  if (!segredoValido(parsed.data)) {
    console.error("[cakto] segredo inválido — evento recusado.");
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }

  try {
    const resultado = await processarEvento(parsed.data, corpo);
    console.log(
      `[cakto] ${parsed.data.event}: ${resultado.detalhe}` +
        (resultado.aplicado ? "" : " (sem efeito)")
    );
    return NextResponse.json({ ok: true, ...resultado });
  } catch (erro) {
    console.error("[cakto] falha ao processar evento:", erro);
    return NextResponse.json({ erro: "falha ao processar" }, { status: 500 });
  }
}
