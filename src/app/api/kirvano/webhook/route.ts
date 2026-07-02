import { NextResponse } from "next/server";
import { definirAssinaturaPorEmail } from "@/lib/data/assinaturaAdmin";
import type { StatusAssinatura } from "@/types/studyflow";

// ATENÇÃO: o formato exato do payload da Kirvano ainda não foi confirmado.
// Este endpoint faz o melhor esforço para extrair os campos abaixo e loga o
// corpo recebido, para ajustarmos o mapeamento com um payload real antes de
// ligar isso em produção. Não considere este endpoint "pronto" até validar
// com um evento de teste de verdade.

function normalizarStatus(valorBruto: unknown): StatusAssinatura {
  const valor = String(valorBruto ?? "").toLowerCase();
  const ativos = ["ativo", "active", "paid", "approved", "aprovado", "pago"];
  const trial = ["trial", "teste"];
  if (ativos.includes(valor)) return "ativo";
  if (trial.includes(valor)) return "trial";
  return "inativo";
}

function extrairEmail(body: Record<string, unknown>): string | null {
  const candidatos = [
    body.email,
    (body.cliente as Record<string, unknown> | undefined)?.email,
    (body.customer as Record<string, unknown> | undefined)?.email,
    (body.comprador as Record<string, unknown> | undefined)?.email,
  ];
  const email = candidatos.find((v) => typeof v === "string" && v.includes("@"));
  return (email as string) ?? null;
}

export async function POST(request: Request) {
  const secretEsperado = process.env.KIRVANO_WEBHOOK_SECRET;
  if (secretEsperado) {
    const secretRecebido =
      request.headers.get("x-kirvano-secret") ??
      new URL(request.url).searchParams.get("secret");
    if (secretRecebido !== secretEsperado) {
      return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
    }
  } else {
    console.warn(
      "[kirvano webhook] KIRVANO_WEBHOOK_SECRET não configurado — endpoint aberto sem validação."
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  console.log("[kirvano webhook] payload recebido:", JSON.stringify(body));

  const email = extrairEmail(body);
  if (!email) {
    console.error("[kirvano webhook] não foi possível extrair o e-mail do payload.");
    return NextResponse.json({ erro: "e-mail não encontrado no payload" }, { status: 400 });
  }

  const status = normalizarStatus(body.status ?? body.evento ?? body.event);
  const plano =
    (body.plano as string | undefined) ??
    (body.produto as string | undefined) ??
    undefined;
  const expiracao =
    (body.expiracao as string | undefined) ??
    (body.data_expiracao as string | undefined) ??
    undefined;

  try {
    const uid = await definirAssinaturaPorEmail(email, { status, plano, expiracao });
    return NextResponse.json({ ok: true, uid, status });
  } catch (erro) {
    console.error("[kirvano webhook] erro ao gravar assinatura:", erro);
    return NextResponse.json(
      { erro: "usuário não encontrado ou falha ao gravar assinatura" },
      { status: 404 }
    );
  }
}
