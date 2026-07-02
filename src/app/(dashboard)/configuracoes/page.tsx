"use client";

import { useEffect, useState, type FormEvent } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/lib/auth/AuthProvider";

type Tema = "claro" | "escuro";

function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle("dark", tema === "escuro");
  localStorage.setItem("sf_tema", tema);
}

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [tema, setTema] = useState<Tema>("claro");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setTema(localStorage.getItem("sf_tema") === "escuro" ? "escuro" : "claro");
    });
  }, []);

  function handleTema(novo: Tema) {
    setTema(novo);
    aplicarTema(novo);
  }

  async function handleSalvarNome(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setErro("");
    setMensagem("");
    setSalvando(true);
    const form = new FormData(e.currentTarget);
    const nome = String(form.get("nome") ?? "").trim();
    try {
      if (!nome) {
        setErro("Informe um nome.");
        return;
      }
      await updateProfile(user, { displayName: nome });
      setMensagem("Nome atualizado!");
    } catch {
      setErro("Não foi possível salvar o nome agora.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900">Configurações</h1>
      <p className="mt-1 text-sm text-slate-500">
        Preferências da sua conta e do aplicativo.
      </p>

      {/* Perfil */}
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Perfil</h2>
        <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
        <form onSubmit={handleSalvarNome} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            name="nome"
            defaultValue={user?.displayName ?? ""}
            placeholder="Seu nome de exibição"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar nome"}
          </button>
        </form>
        {mensagem && <p className="mt-2 text-sm text-emerald-600">{mensagem}</p>}
        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      </div>

      {/* Tema */}
      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Aparência</h2>
        <p className="mt-1 text-xs text-slate-500">
          Escolha entre o tema claro e o escuro.
        </p>
        <div className="mt-4 flex gap-2 rounded-lg bg-slate-100 p-1 text-sm font-medium sm:max-w-xs">
          <button
            onClick={() => handleTema("claro")}
            className={`flex-1 rounded-md py-2 transition ${
              tema === "claro" ? "bg-white text-slate-900 shadow" : "text-slate-500"
            }`}
          >
            ☀️ Claro
          </button>
          <button
            onClick={() => handleTema("escuro")}
            className={`flex-1 rounded-md py-2 transition ${
              tema === "escuro" ? "bg-white text-slate-900 shadow" : "text-slate-500"
            }`}
          >
            🌙 Escuro
          </button>
        </div>
      </div>
    </div>
  );
}
