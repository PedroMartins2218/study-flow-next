import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ativarTrialSeElegivel } from "@/lib/data/trialAdmin";

// Ativa o teste grátis do usuário autenticado. Exige o ID token do Firebase
// (Authorization: Bearer <token>) para confirmar a identidade e o e-mail.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ erro: "não autenticado" }, { status: 401 });
  }

  let uid: string;
  let email: string | undefined;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email;
  } catch (erro) {
    console.error("[trial] token inválido:", erro);
    return NextResponse.json({ erro: "sessão inválida" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ erro: "conta sem e-mail" }, { status: 400 });
  }

  try {
    const resultado = await ativarTrialSeElegivel(uid, email);
    if (!resultado.ok) {
      return NextResponse.json({ erro: resultado.motivo }, { status: resultado.status });
    }
    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("[trial] erro ao ativar:", erro);
    return NextResponse.json(
      { erro: "não foi possível ativar seu teste agora" },
      { status: 500 }
    );
  }
}
