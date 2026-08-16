import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/marketing/Logo";

export const metadata: Metadata = {
  title: "Compra confirmada — Study Flow",
  robots: { index: false, follow: false },
};

// Destino do checkout da Kirvano. O ponto crítico desta tela é um só: a pessoa
// precisa criar a conta com o MESMO e-mail que usou na compra, senão o webhook
// (que só conhece o e-mail) não tem como ligar o pagamento à conta.
export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const emailBruto = params.email;
  const email = typeof emailBruto === "string" ? emailBruto : "";

  const linkCadastro = email
    ? `/login?cadastro=1&email=${encodeURIComponent(email)}`
    : "/login?cadastro=1";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="flex justify-center">
          <Logo />
        </div>

        <span className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-7 w-7"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>

        <h1 className="mt-5 text-xl font-semibold text-slate-900">
          Pagamento recebido!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Falta só um passo para liberar seu acesso: criar sua conta no Study Flow.
        </p>

        <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-left">
          <p className="text-sm font-semibold text-amber-900">
            Use o mesmo e-mail da compra
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            É por ele que reconhecemos seu pagamento e liberamos o acesso
            automaticamente.
            {email && (
              <>
                {" "}
                No seu caso: <strong className="break-all">{email}</strong>
              </>
            )}
          </p>
        </div>

        <Link
          href={linkCadastro}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Criar minha conta
        </Link>

        <p className="mt-4 text-xs text-slate-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Entrar
          </Link>{" "}
          — seu acesso é liberado assim que você entrar.
        </p>

        <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
          O pagamento pode levar alguns instantes para ser confirmado. Se o acesso
          não aparecer, use o botão &quot;Já paguei&quot; na tela de assinatura.
        </p>
      </div>
    </div>
  );
}
