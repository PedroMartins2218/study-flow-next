const PERFIS = [
  {
    titulo: "Vestibulando",
    desc: "Muita matéria, redação toda semana e simulado chegando. O Study Flow reúne prazos e progresso num painel só, pra você parar de depender da memória.",
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l6.16-3.42A12 12 0 0112 20.5a12 12 0 01-6.16-9.92L12 14z"
      />
    ),
  },
  {
    titulo: "Concurseiro",
    desc: "Edital extenso e estudo de longo prazo. Organize os ciclos, veja o que ficou atrasado e mantenha a constância sem abrir três apps diferentes.",
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    titulo: "Universitário",
    desc: "Trabalhos, provas e entregas de várias cadeiras ao mesmo tempo. Tenha tudo à vista por prazo e use o modo foco pra realmente sentar e produzir.",
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.25C10.5 5 8 4.5 5.5 4.75v13c2.5-.25 5 .25 6.5 1.5m0-13c1.5-1.25 4-1.75 6.5-1.5v13c-2.5-.25-5 .25-6.5 1.5m0-13v13"
      />
    ),
  },
];

export function Testimonials() {
  return (
    <section className="bg-slate-50/70 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Para quem é
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Feito para quem precisa se organizar de verdade
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Não importa o objetivo — se a rotina de estudo é puxada, o Study Flow
            dá a estrutura pra você seguir com clareza e constância.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {PERFIS.map((p) => (
            <div
              key={p.titulo}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6"
                >
                  {p.icone}
                </svg>
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
