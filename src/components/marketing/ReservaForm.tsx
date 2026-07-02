"use client";

import { useState, type FormEvent } from "react";

const PLANOS = ["Fundador mensal (R$ 9,90/mês)", "Fundador anual (R$ 97/ano)"];

export function ReservaForm() {
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    try {
      const resp = await fetch("/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.get("nome"),
          email: form.get("email"),
          plano: form.get("plano"),
          objetivo: form.get("objetivo"),
        }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados.erro ?? "Não foi possível registrar sua reserva.");
      } else {
        setSucesso(true);
      }
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
        <p className="text-lg font-semibold text-emerald-800">
          Reserva garantida! 🎉
        </p>
        <p className="mt-2 text-sm text-emerald-700">
          Quando o Study Flow abrir, você vai receber o link de acesso com a
          condição de fundador. Sem cobrança agora.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <input
        name="nome"
        required
        placeholder="Seu nome"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Seu melhor e-mail"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <select
        name="plano"
        defaultValue={PLANOS[0]}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        {PLANOS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <textarea
        name="objetivo"
        rows={3}
        placeholder="O que você mais quer resolver nos seus estudos? (opcional)"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      {erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Garantir minha reserva de fundador"}
      </button>
      <p className="text-center text-xs text-slate-400">
        Sem cartão agora. Você só paga quando o acesso abrir, se quiser continuar.
      </p>
    </form>
  );
}
