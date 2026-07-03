"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Tom = "sucesso" | "erro" | "info";
type ToastItem = { id: number; msg: string; tom: Tom };

const ToastCtx = createContext<(msg: string, tom?: Tom) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

function Icone({ tom }: { tom: Tom }) {
  const d =
    tom === "sucesso"
      ? "M4.5 12.75l6 6 9-13.5"
      : tom === "erro"
        ? "M6 18L18 6M6 6l12 12"
        : "M12 9v4m0 4h.01";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((msg: string, tom: Tom = "sucesso") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, tom }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm text-slate-900 shadow-lg ring-1 ring-slate-200"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
                t.tom === "sucesso"
                  ? "bg-emerald-500"
                  : t.tom === "erro"
                    ? "bg-red-500"
                    : "bg-blue-500"
              }`}
            >
              <Icone tom={t.tom} />
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
