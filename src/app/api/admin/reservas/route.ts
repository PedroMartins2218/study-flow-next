import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { listarReservas } from "@/lib/data/reservasAdmin";

/**
 * Compara a chave sem vazar o tamanho do prefixo correto pelo tempo de
 * resposta. Igualdade simples devolve mais rápido quanto antes os caracteres
 * divergem, o que dá para medir e usar para adivinhar a chave caractere a
 * caractere.
 */
function chaveConfere(recebida: string, esperada: string): boolean {
  const a = Buffer.from(recebida, "utf8");
  const b = Buffer.from(esperada, "utf8");
  // timingSafeEqual exige o mesmo tamanho; comparar o tamanho antes vaza só o
  // comprimento, que não ajuda a adivinhar o conteúdo.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Painel de admin protegido por chave (ADMIN_SECRET). Não usa verificação de
// token de login de propósito, para não depender do caminho jwks-rsa/jose do
// firebase-admin. Os dados aqui são leads que a própria pessoa enviou.
//
// A chave é aceita SÓ pelo cabeçalho. Antes valia também `?key=` na URL, e
// chave em URL vaza para o histórico do navegador, para os logs de acesso do
// Netlify e para o cabeçalho Referer de qualquer link clicado a partir da
// página.
export async function GET(request: Request) {
  const esperado = (process.env.ADMIN_SECRET ?? "").trim();
  const recebido = (request.headers.get("x-admin-key") ?? "").trim();

  if (!esperado || !recebido || !chaveConfere(recebido, esperado)) {
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
