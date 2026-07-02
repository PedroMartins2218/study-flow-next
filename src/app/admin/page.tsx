"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Reserva } from "@/types/studyflow";

const CHAVE_STORAGE = "sf_admin_key";

function paraCSV(reservas: Reserva[]): string {
  const cabecalho = ["nome", "email", "plano", "objetivo", "criadoEm"];
  const escapar = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linhas = reservas.map((r) =>
    [r.nome, r.email, r.plano ?? "", r.objetivo ?? "", r.criadoEm ?? ""]
      .map(escapar)
      .join(",")
  );
  return [cabecalho.join(","), ...linhas].join("\n");
}

export default function AdminPage() {
  const [chave, setChave] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function carregar(chaveUsar: string) {
    setErro("");
    setCarregando(true);
    try {
      const resp = await fetch("/api/admin/reservas", {
        headers: { "x-admin-key": chaveUsar },
      });
      if (resp.status === 401) {
        setErro("Chave inválida.");
        setAutenticado(false);
        localStorage.removeItem(CHAVE_STORAGE);
        return;
      }
      const dados = await resp.json();
      setReservas(dados.reservas ?? []);
      setAutenticado(true);
      localStorage.setItem(CHAVE_STORAGE, chaveUsar);
    } catch {
      setErro("Falha ao carregar.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const salva = localStorage.getItem(CHAVE_STORAGE);
    if (salva) {
      queueMicrotask(() => void carregar(salva));
    }
  }, []);

  function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void carregar(chave);
  }

  function baixarCSV() {
    const blob = new Blob([paraCSV(reservas)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-studyflow-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!autenticado) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <h1 className="text-lg font-semibold text-slate-900">Painel de reservas</h1>
          <p className="text-sm text-slate-500">Digite a chave de admin para acessar.</p>
          <input
            type="password"
            value={chave}
            onChange={(e) => setChave(e.target.value)}
            placeholder="Chave de admin"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {carregando ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reservas</h1>
          <p className="text-sm text-slate-500">
            {reservas.length} pessoa(s) reservaram acesso.
          </p>
        </div>
        <button
          onClick={baixarCSV}
          disabled={reservas.length === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Baixar CSV
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-900">{r.nome}</td>
                <td className="px-4 py-3 text-slate-700">{r.email}</td>
                <td className="px-4 py-3 text-slate-500">{r.plano ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{r.objetivo ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400">
                  {r.criadoEm ? new Date(r.criadoEm).toLocaleDateString("pt-BR") : "—"}
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma reserva ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
