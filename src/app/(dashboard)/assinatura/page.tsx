"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { assinaturaEstaAtiva, subscribeToAssinatura } from "@/lib/data/assinatura";
import type { Assinatura } from "@/types/studyflow";

const CHECKOUT_URL = process.env.NEXT_PUBLIC_KIRVANO_CHECKOUT_URL;

export default function AssinaturaPage() {
  const { user } = useAuth();
  const [assinatura, setAssinatura] = useState<Assinatura | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    return subscribeToAssinatura(user.uid, setAssinatura);
  }, [user]);

  if (assinatura === undefined) {
    return (
      <div className="mx-auto max-w-md text-center text-sm text-slate-500">
        Carregando...
      </div>
    );
  }

  const ativa = assinaturaEstaAtiva(assinatura);

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-xl font-semibold text-slate-900">Assinatura</h1>

      {ativa ? (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-emerald-700">
            Sua assinatura está ativa.
          </p>
          {assinatura?.plano && (
            <p className="mt-1 text-sm text-slate-500">Plano: {assinatura.plano}</p>
          )}
          {assinatura?.expiracao && (
            <p className="mt-1 text-sm text-slate-500">
              Válida até {assinatura.expiracao}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-red-700">
            {assinatura
              ? "Sua assinatura expirou ou está inativa."
              : "Você ainda não tem uma assinatura ativa."}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Assine para continuar organizando seus estudos no Study Flow.
          </p>
          {CHECKOUT_URL ? (
            <a
              href={CHECKOUT_URL}
              className="mt-4 inline-block rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Assinar agora
            </a>
          ) : (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Link de checkout ainda não configurado (NEXT_PUBLIC_KIRVANO_CHECKOUT_URL).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
