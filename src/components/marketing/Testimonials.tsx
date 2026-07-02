const DEPOIMENTOS = [
  {
    nome: "Marina",
    papel: "Vestibulanda",
    texto:
      "Antes eu vivia esquecendo prazo de redação e simulado. Ter tudo num painel só tirou esse peso da minha cabeça.",
  },
  {
    nome: "Rafael",
    papel: "Concurseiro",
    texto:
      "O que eu mais precisava era ver o que tinha ficado atrasado sem abrir três apps diferentes. Isso resolveu.",
  },
  {
    nome: "Beatriz",
    papel: "Universitária",
    texto:
      "Os ciclos de foco me ajudaram a realmente sentar e estudar, em vez de só planejar o dia inteiro.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Feito para quem estuda assim
        </h2>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Situações parecidas com a de quem já garantiu o acesso de fundador.
        </p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {DEPOIMENTOS.map((d) => (
          <figure
            key={d.nome}
            className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <blockquote className="flex-1 text-sm leading-relaxed text-slate-600">
              &ldquo;{d.texto}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {d.nome[0]}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{d.nome}</p>
                <p className="text-xs text-slate-500">{d.papel}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
