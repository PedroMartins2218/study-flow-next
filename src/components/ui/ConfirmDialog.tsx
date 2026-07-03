"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Opts = {
  titulo: string;
  descricao?: string;
  confirmar?: string;
  perigo?: boolean;
};
type Estado = { opts: Opts; resolve: (v: boolean) => void };

const ConfirmCtx = createContext<(opts: Opts) => Promise<boolean>>(async () => false);

export function useConfirm() {
  return useContext(ConfirmCtx);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado | null>(null);

  const confirmar = useCallback(
    (opts: Opts) => new Promise<boolean>((resolve) => setEstado({ opts, resolve })),
    []
  );

  const responder = useCallback(
    (v: boolean) => {
      setEstado((atual) => {
        atual?.resolve(v);
        return null;
      });
    },
    []
  );

  useEffect(() => {
    if (!estado) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") responder(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [estado, responder]);

  return (
    <ConfirmCtx.Provider value={confirmar}>
      {children}
      {estado && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => responder(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={estado.opts.titulo}
            className="animate-in relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
          >
            <span
              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                estado.opts.perigo ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-5 w-5">
                {estado.opts.perigo ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                )}
              </svg>
            </span>
            <h2 className="mt-3 text-base font-semibold text-slate-900">{estado.opts.titulo}</h2>
            {estado.opts.descricao && (
              <p className="mt-1 text-sm text-slate-500">{estado.opts.descricao}</p>
            )}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => responder(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => responder(true)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white transition ${
                  estado.opts.perigo ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {estado.opts.confirmar ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
