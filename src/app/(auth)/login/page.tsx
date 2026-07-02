"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Logo } from "@/components/marketing/Logo";

type Aba = "login" | "cadastro";

function mensagemErro(erro: unknown): string {
  const codigo = (erro as { code?: string })?.code ?? "";
  switch (codigo) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado.";
    case "auth/weak-password":
      return "Senha muito curta (mínimo 6 caracteres).";
    case "auth/invalid-email":
      return "E-mail inválido.";
    default:
      return "Não foi possível concluir a operação. Tente novamente.";
  }
}

export default function LoginPage() {
  const { user, loading, login, registrar, loginComGoogle, erroInicializacao } =
    useAuth();
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("login");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("senha")));
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  async function handleCadastro(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    const senha = String(form.get("senha"));
    if (senha.length < 6) {
      setErro("Senha mínima de 6 caracteres.");
      setEnviando(false);
      return;
    }
    try {
      await registrar(String(form.get("email")), senha);
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  async function handleGoogle() {
    setErro("");
    try {
      await loginComGoogle();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <Logo />
      <p className="mt-3 text-sm text-slate-500">
        Organize seus estudos, acompanhe sua evolução e transforme foco em
        resultado.
      </p>

      <div className="mt-6 flex gap-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setAba("login")}
          className={`flex-1 rounded-md py-2 transition ${
            aba === "login" ? "bg-white shadow text-slate-900" : "text-slate-500"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setAba("cadastro")}
          className={`flex-1 rounded-md py-2 transition ${
            aba === "cadastro" ? "bg-white shadow text-slate-900" : "text-slate-500"
          }`}
        >
          Criar conta
        </button>
      </div>

      {erroInicializacao && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
          {erroInicializacao}
        </p>
      )}

      {erro && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {erro}
        </p>
      )}

      {aba === "login" ? (
        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <input
            name="senha"
            type="password"
            required
            placeholder="Senha"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCadastro} className="mt-6 space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <input
            name="senha"
            type="password"
            required
            placeholder="Senha (mínimo 6 caracteres)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        ou
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="mt-4 w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Continuar com Google
      </button>
    </div>
  );
}
