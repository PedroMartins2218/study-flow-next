import { NextResponse } from "next/server";
import { listarReservas } from "@/lib/data/reservasAdmin";

// Painel de admin protegido por chave (ADMIN_SECRET). Não usa verificação de
// token de login de propósito, para não depender do caminho jwks-rsa/jose do
// firebase-admin. Os dados aqui são leads que a própria pessoa enviou.
export async function GET(request: Request) {
  const esperado = process.env.ADMIN_SECRET;
  const recebido =
    request.headers.get("x-admin-key") ??
    new URL(request.url).searchParams.get("key");

  if (!esperado || recebido !== esperado) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }

  try {
    const reservas = await listarReservas();
    return NextResponse.json({ total: reservas.length, reservas });
  } catch (erro) {
    console.error("[admin/reservas] erro ao listar:", erro);
    return NextResponse.json({ erro: "falha ao listar reservas" }, { status: 500 });
  }
}
