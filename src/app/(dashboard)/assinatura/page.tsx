"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { assinaturaEstaAtiva, subscribeToAssinatura } from "@/lib/data/assinatura";
import { PLANOS, PLANO_PRO, planoDoTier, type Plano } from "@/lib/planos";
import type { Assinatura } from "@/types/studyflow";

function CardPlano({ plano, compacto = false }: { plano: Plano; compacto?: boolean }) {
  const ehPro = plano.tier === "pro";

  return (
    <div
      className={`flex flex-col rounded-2xl p-6 text-left shadow-sm ring-1 ${
        ehPro
          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-blue-600"
          : "bg-white text-slate-900 ring-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Study Flow {plano.nome}</h3>
        {plano.destaque && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              ehPro ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700"
            }`}
          >
            {plano.destaque}
          </span>
        )}
      </div>

      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold">{plano.preco}</span>
        <span className={`text-sm ${ehPro ? "text-blue-100" : "text-slate-500"}`}>/mês</span>
      </p>
      <p className={`mt-1 text-sm ${ehPro ? "text-blue-100" : "text-slate-600"}`}>
        {plano.resumo}
      </p>

      {!compacto && (
        <ul className="mt-5 space-y-2.5">
          {plano.beneficios.map((b) => (
            <li
              key={b}
              className={`flex items-start gap-2 text-sm ${
                ehPro ? "text-blue-50" : "text-slate-600"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`mt-0.5 h-4 w-4 shrink-0 ${ehPro ? "text-white" : "text-blue-600"}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      )}

      {plano.checkoutUrl ? (
        <a
          href={plano.checkoutUrl}
          className={`mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            ehPro
              ? "bg-white text-blue-700 hover:bg-blue-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Assinar {plano.nome}
        </a>
      ) : (
        <p
          className={`mt-6 rounded-lg px-3 py-2 text-xs ${
            ehPro ? "bg-white/10 text-blue-50" : "bg-amber-50 text-amber-800"
          }`}
        >
          Link de assinatura em configuração.
        </p>
      )}
    </div>
  );
}

export default function AssinaturaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [assinatura, setAssinatura] = useState<Assinatura | null | undefined>(undefined);
  const [ativandoTrial, setAtivandoTrial] = useState(false);
  const [erroTrial, setErroTrial] = useState("");
  const [sincronizando, setSincronizando] = useState(false);
  const [avisoSync, setAvisoSync] = useState("");

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
      router.replace("/dashboard");
    } catch {
      setErroTrial("Falha de conexão. Tente novamente.");
    } finally {
      setAtivandoTrial(false);
    }
  }

  // Rede de segurança do fluxo "pagou antes de criar conta": se o e-mail da
  // compra bate com o da conta, isto puxa o acesso na hora.
  async function jaPaguei() {
    if (!user) return;
    setAvisoSync("");
    setSincronizando(true);
    try {
      const token = await user.getIdToken();
      const resp = await fetch("/api/assinatura/sincronizar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setAvisoSync(dados.erro ?? "Não foi possível verificar sua compra.");
        return;
      }
      if (dados.ativa) {
        router.replace("/dashboard");
        return;
      }
      setAvisoSync(
        "Ainda não encontramos um pagamento para este e-mail. Se você pagou com outro e-mail, fale com o suporte."
      );
    } catch {
      setAvisoSync("Falha de conexão. Tente novamente.");
    } finally {
      setSincronizando(false);
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
  const planoAtual = planoDoTier(assinatura?.tier);

  if (ativa) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold text-slate-900">Assinatura</h1>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-emerald-700">
            {ehTrial ? "Seu teste grátis está ativo." : "Sua assinatura está ativa."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Plano: {ehTrial ? "Teste grátis" : planoAtual?.nome ?? assinatura?.plano ?? "—"}
          </p>
          {assinatura?.expiracao && (
            <p className="mt-1 text-sm text-slate-500">
              {assinatura.status === "cancelado"
                ? "Acesso disponível até"
                : ehTrial
                  ? "Teste válido até"
                  : "Renova em"}{" "}
              {assinatura.expiracao}
            </p>
          )}
          {assinatura?.status === "inadimplente" && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Não conseguimos confirmar seu último pagamento. Regularize para não
              perder o acesso na próxima renovação.
            </p>
          )}
          {assinatura?.status === "cancelado" && (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Sua assinatura foi cancelada e não será renovada. Você mantém o
              acesso até a data acima.
            </p>
          )}
        </div>

        {/* Quem está no Base vê o que ganha subindo para o Pro. */}
        {assinatura?.tier !== "pro" && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-900">
              Quer o Agente de IA?
            </p>
            <CardPlano plano={PLANO_PRO} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900">Assinatura</h1>
      <p className="mt-2 text-sm text-slate-600">
        {nuncaTeve
          ? "Escolha seu plano e comece a organizar seus estudos hoje."
          : ehTrial
            ? "Seu teste grátis terminou. Escolha um plano para continuar."
            : "Sua assinatura está inativa. Escolha um plano para voltar a usar."}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANOS.map((plano) => (
          <CardPlano key={plano.tier} plano={plano} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-900">Já assinou e o acesso não liberou?</p>
        <p className="mt-1 text-xs text-slate-500">
          Se você pagou com este mesmo e-mail, é só clicar abaixo.
        </p>
        <button
          onClick={jaPaguei}
          disabled={sincronizando}
          className="mt-3 rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:opacity-60"
        >
          {sincronizando ? "Verificando..." : "Já paguei, liberar meu acesso"}
        </button>
        {avisoSync && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{avisoSync}</p>
        )}
      </div>

      {nuncaTeve && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">
            Reservou seu acesso de fundador antes do lançamento? Ative seus{" "}
            <strong>7 dias grátis</strong> em vez de assinar direto.
          </p>
          <button
            onClick={ativarTrial}
            disabled={ativandoTrial}
            className="mt-3 rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:opacity-60"
          >
            {ativandoTrial ? "Ativando..." : "Ativar meus 7 dias grátis"}
          </button>
          {erroTrial && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroTrial}</p>
          )}
        </div>
      )}
    </div>
  );
}
