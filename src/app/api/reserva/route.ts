import { NextResponse } from "next/server";
import { reservaInputSchema } from "@/lib/validators/studyflow";
import { registrarReserva } from "@/lib/data/reservasAdmin";
import { jaLancou } from "@/lib/launch";

export async function POST(request: Request) {
  // Depois do lançamento, as reservas de fundador encerram.
  if (jaLancou()) {
    return NextResponse.json(
      { erro: "As reservas de fundador foram encerradas — o Study Flow já está no ar." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "corpo inválido" }, { status: 400 });
  }

  const parsed = reservaInputSchema.safeParse(body);
  if (!parsed.success) {
    const primeiroErro = parsed.error.issues[0]?.message ?? "dados inválidos";
    return NextResponse.json({ erro: primeiroErro }, { status: 400 });
  }

  try {
    await registrarReserva(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("[reserva] erro ao gravar:", erro);
    return NextResponse.json(
      { erro: "não foi possível registrar sua reserva agora" },
      { status: 500 }
    );
  }
}
