"use client";

import { useEffect } from "react";

// Painel lateral deslizante (da direita). Usado para formulários de criar/editar
// nas telas internas. Fecha ao clicar no fundo ou apertar Esc.
export function SlideOver({
  aberto,
  onFechar,
  titulo,
  children,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);

  return (
    <div
      className={`fixed inset-0 z-50 ${aberto ? "" : "pointer-events-none"}`}
      aria-hidden={!aberto}
    >
      {/* Fundo escurecido */}
      <div
        onClick={onFechar}
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ${
          aberto ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Painel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
