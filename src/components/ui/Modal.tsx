"use client";

import { useEffect, useRef } from "react";

// Janela centralizada para os formulários de criar/editar das telas internas.
// Substituiu o painel lateral (SlideOver): no celular o painel cobria a tela
// inteira de qualquer jeito, e um card centralizado lê melhor nos dois tamanhos.
//
// No mobile ele ancora embaixo e ocupa quase toda a altura — um card pequeno no
// meio da tela ficaria impraticável com formulários longos (o Caderno tem um
// textarea de 10 linhas).
export function Modal({
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
  const painelRef = useRef<HTMLDivElement>(null);
  // Guarda quem abriu o modal para devolver o foco ao fechar (leitor de tela e
  // navegação por teclado perdiam a posição no SlideOver antigo).
  const origemFoco = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!aberto) return;

    origemFoco.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Foca o primeiro campo utilizável, para já poder digitar.
    const t = setTimeout(() => {
      const alvo = painelRef.current?.querySelector<HTMLElement>(
        "input:not([type=hidden]), textarea, select"
      );
      alvo?.focus();
    }, 60);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      origemFoco.current?.focus?.();
    };
  }, [aberto, onFechar]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 ${
        aberto ? "" : "pointer-events-none"
      }`}
      aria-hidden={!aberto}
    >
      {/* Fundo escurecido */}
      <div
        onClick={onFechar}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-200 ${
          aberto ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Painel */}
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl transition-all duration-200 ease-out sm:max-h-[85vh] sm:rounded-2xl ${
          aberto
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95"
        }`}
      >
        {/* Alça visual do bottom sheet (só no celular) */}
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" />

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
