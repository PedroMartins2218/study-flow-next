"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { assinaturaEstaAtiva, subscribeToAssinatura } from "@/lib/data/assinatura";
import type { Assinatura } from "@/types/studyflow";

const CHECKOUT_URL = process.env.NEXT_PUBLIC_KIRVANO_CHECKOUT_URL;

export default function AssinaturaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [assinatura, setAssinatura] = useState<Assinatura | null | undefined>(undefined);
  const [ativandoTrial, setAtivandoTrial] = useState(false);
  const [erroTrial, setErroTrial] = useState("");

  useEffect(() => {
    if (!user) return;
    return subscribeToAssinatura(user.uid, setAssinatura);
  }, [user]);

  async function ativarTrial() {
    if (!user) return;
    setErroTrial("");
    setAtivandoTrial(true);
    try {
      const token = await user.getIdToken();
      const resp = await fetch("/api/trial/ativar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErroTrial(dados.erro ?? "Não foi possível ativar seu teste.");
        return;
      }
      // a assinatura vai atualizar via onSnapshot; leva pro painel
      router.replace("/dashboard");
    } catch {
      setErroTrial("Falha de conexão. Tente novamente.");
    } finally {
      setAtivandoTrial(false);
    }
  }

  if (assinatura === undefined) {
    return (
      <div className="mx-auto flex max-w-md justify-center py-10">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  const ativa = assinaturaEstaAtiva(assinatura);
  const ehTrial = assinatura?.status === "trial";
  const nuncaTeve = assinatura === null;

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-xl font-semibold text-slate-900">Assinatura</h1>

      {ativa ? (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-emerald-700">
            {ehTrial ? "Seu teste grátis está ativo." : "Sua assinatura está ativa."}
          </p>
          {assinatura?.plano && (
            <p className="mt-1 text-sm text-slate-500">
              Plano: {assinatura.plano === "trial" ? "Teste grátis" : assinatura.plano}
            </p>
          )}
          {assinatura?.expiracao && (
            <p className="mt-1 text-sm text-slate-500">
              {ehTrial ? "Teste válido até" : "Válida até"} {assinatura.expiracao}
            </p>
          )}
        </div>
      ) : nuncaTeve ? (
        // Nunca teve assinatura → oferece o teste grátis (só quem reservou consegue)
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-900">Comece seu teste grátis</p>
          <p className="mt-2 text-sm text-slate-600">
            Reservou seu acesso de fundador? Ative agora <strong>7 dias grátis</strong> —
            sem cartão.
          </p>
          <button
            onClick={ativarTrial}
            disabled={ativandoTrial}
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {ativandoTrial ? "Ativando..." : "Ativar meus 7 dias grátis"}
          </button>
          {erroTrial && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroTrial}</p>
          )}
        </div>
      ) : (
        // Já teve (trial expirado / inativo) → precisa assinar
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-red-700">
            {ehTrial ? "Seu teste grátis terminou." : "Sua assinatura expirou ou está inativa."}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Assine para continuar organizando seus estudos no Study Flow.
          </p>
          {CHECKOUT_URL ? (
            <a
              href={CHECKOUT_URL}
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Assinar agora
            </a>
          ) : (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Em breve: link de assinatura. Estamos finalizando o pagamento.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
