const NAV = ["Dashboard", "Matérias", "Atividades", "Provas", "Caderno", "Foco"];

const METRICAS: { titulo: string; valor: string; chip: string; texto: string }[] = [
  { titulo: "Matérias", valor: "6", chip: "#dbeafe", texto: "#1d4ed8" },
  { titulo: "Atividades", valor: "3", chip: "#ede9fe", texto: "#6d28d9" },
  { titulo: "Trabalhos", valor: "1", chip: "#fef3c7", texto: "#b45309" },
  { titulo: "Foco hoje", valor: "45min", chip: "#dcfce7", texto: "#15803d" },
];

const HOJE: { texto: string; cor: string; badge: string; tom: string; fundo: string }[] = [
  { texto: "Entregar redação · Português", cor: "#d97706", badge: "Hoje", tom: "#b45309", fundo: "#fef3c7" },
  { texto: "Lista de exercícios · Matemática", cor: "#dc2626", badge: "Atrasado", tom: "#b91c1c", fundo: "#fee2e2" },
  { texto: "Revisar capítulo 4 · História", cor: "#2563eb", badge: "Hoje", tom: "#1d4ed8", fundo: "#dbeafe" },
];

const BARRAS = [40, 70, 30, 92, 55, 78, 48];

// Prévia da interface real do Study Flow, dentro de uma "janela de navegador".
export function PreviewApp() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Por dentro
        </span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Veja o Study Flow por dentro
        </h2>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          Um painel limpo e direto — do jeito que você vai usar todo dia.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200">
        {/* Barra do navegador */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 hidden rounded-md bg-white px-3 py-1 text-xs text-slate-400 ring-1 ring-slate-200 sm:block">
            studyflow.app/dashboard
          </span>
        </div>

        <div className="flex">
          {/* Sidebar (desktop) */}
          <aside className="hidden w-44 shrink-0 flex-col gap-1 bg-slate-950 p-3 sm:flex">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white">
                ST
              </span>
              <span className="text-sm font-bold text-white">Study Flow</span>
            </div>
            {NAV.map((n, i) => (
              <div
                key={n}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  i === 0 ? "bg-blue-600 text-white" : "text-slate-400"
                }`}
              >
                {n}
              </div>
            ))}
          </aside>

          {/* Conteúdo */}
          <div className="flex-1 bg-slate-50 p-4 sm:p-5">
            <p className="text-base font-semibold text-slate-900">Boa tarde, Pedro</p>
            <p className="text-xs text-slate-500">Você tem 3 tarefas para hoje.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {METRICAS.map((m) => (
                <div key={m.titulo} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <span
                    className="inline-flex h-6 w-6 rounded-lg"
                    style={{ background: m.chip, color: m.texto }}
                  />
                  <p className="mt-2 text-xl font-semibold text-slate-900">{m.valor}</p>
                  <p className="text-[11px] text-slate-500">{m.titulo}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-semibold text-slate-900">Hoje</p>
                <div className="mt-2 flex flex-col">
                  {HOJE.map((h) => (
                    <div
                      key={h.texto}
                      className="flex items-center gap-2 border-t border-slate-100 py-2 first:border-t-0"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: h.cor }} />
                      <span className="flex-1 truncate text-[11px] text-slate-600">{h.texto}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: h.fundo, color: h.tom }}
                      >
                        {h.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-semibold text-slate-900">Foco · últimos 7 dias</p>
                <div className="mt-4 flex h-20 items-end gap-2">
                  {BARRAS.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${i === 6 ? "bg-blue-300" : "bg-blue-600"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
