import Link from "next/link";
import { ReservaForm } from "@/components/marketing/ReservaForm";
import { Testimonials } from "@/components/marketing/Testimonials";

const FUNCOES = [
  {
    titulo: "Matérias e progresso",
    desc: "Cadastre suas matérias e acompanhe o quanto já avançou em cada uma.",
    cor: "bg-indigo-100 text-indigo-700",
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.25C10.5 5 8 4.5 5.5 4.75v13c2.5-.25 5 .25 6.5 1.5m0-13c1.5-1.25 4-1.75 6.5-1.5v13c-2.5-.25-5 .25-6.5 1.5m0-13v13"
      />
    ),
  },
  {
    titulo: "Atividades e trabalhos",
    desc: "Saiba o que fazer hoje e o que está atrasado, sem depender da memória.",
    cor: "bg-violet-100 text-violet-700",
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75l2.25 2.25 4.5-4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    titulo: "Provas e simulados",
    desc: "Tenha as datas importantes sempre à vista e organize a preparação.",
    cor: "bg-sky-100 text-sky-700",
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6h15A1.5 1.5 0 0121 7.5v12a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-12A1.5 1.5 0 014.5 6z"
      />
    ),
  },
  {
    titulo: "Modo foco (Pomodoro)",
    desc: "Estude em ciclos de foco e registre suas sessões automaticamente.",
    cor: "bg-emerald-100 text-emerald-700",
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 2M12 3.75a8.25 8.25 0 108.25 8.25M9.75 3.75h4.5"
      />
    ),
  },
];

const BENEFICIOS = [
  "Matérias e progresso ilimitados",
  "Atividades e trabalhos organizados por prazo",
  "Provas e simulados com contagem regressiva",
  "Modo foco (Pomodoro) com histórico de sessões",
  "Acesso pelo navegador, no computador ou celular",
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Topo */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <span className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
            Study Flow
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Entrar
            </Link>
            <a
              href="#reservar"
              className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:inline-flex"
            >
              Reservar vaga
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-14rem] -z-10 flex justify-center"
        >
          <div className="h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-indigo-200 via-violet-200 to-transparent opacity-60 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
            Acesso de fundador em pré-lançamento
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Organize seus estudos, acompanhe sua evolução e transforme{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              foco em resultado
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
            O Study Flow é o painel do estudante: matérias, atividades, trabalhos,
            provas e foco num só lugar. Simples, direto e feito para quem precisa
            de constância — não é mais um cursinho, é a sua organização.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#reservar"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700"
            >
              Garantir minha vaga de fundador
            </a>
            <a
              href="#funcionalidades"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Ver como funciona
            </a>
          </div>
          <p className="mt-5 text-xs text-slate-400">
            Sem cartão agora · Cancele quando quiser · Leva 2 minutos
          </p>
        </div>
      </section>

      {/* Funções */}
      <section id="funcionalidades" className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Tudo que você precisa para estudar com constância
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Um painel só, sem depender de memória nem de planilhas espalhadas.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FUNCOES.map((f) => (
            <div
              key={f.titulo}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.cor}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-6 w-6"
                >
                  {f.icone}
                </svg>
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{f.titulo}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <Testimonials />

      {/* Planos */}
      <section id="planos" className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Preço de fundador
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Condição especial de lançamento, por tempo limitado.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Mensal */}
          <div className="flex flex-col rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
            <h3 className="font-semibold text-slate-900">Fundador mensal</h3>
            <p className="mt-3 text-4xl font-semibold text-slate-900">
              R$ 9,90
              <span className="text-base font-normal text-slate-500">/mês</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">Acesso a tudo, cancele quando quiser.</p>
            <ul className="mt-6 flex-1 space-y-3">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
            <a
              href="#reservar"
              className="mt-7 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Quero o mensal
            </a>
          </div>

          {/* Anual */}
          <div className="relative flex flex-col rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-600 sm:scale-[1.03]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow">
              Mais popular
            </span>
            <h3 className="font-semibold">Fundador anual</h3>
            <p className="mt-3 text-4xl font-semibold">
              R$ 97<span className="text-base font-normal text-indigo-100">/ano</span>
            </p>
            <p className="mt-2 text-sm text-indigo-100">
              Equivalente a R$ 8,08/mês · economize cerca de 18%
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {BENEFICIOS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-indigo-50">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="mt-0.5 h-4 w-4 shrink-0 text-white"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
            <a
              href="#reservar"
              className="mt-7 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              Quero o anual
            </a>
          </div>
        </div>
      </section>

      {/* Reserva */}
      <section id="reservar" className="mx-auto w-full max-w-md px-6 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Reserve seu acesso agora
        </h2>
        <p className="mt-2 mb-6 text-center text-sm text-slate-500">
          Deixe seus dados e garanta a condição de fundador. Quando o acesso
          abrir, você recebe o link para assinar. Nada é cobrado agora.
        </p>
        <ReservaForm />
      </section>

      <footer className="border-t border-slate-200 px-6 py-8 text-center text-xs text-slate-400">
        Study Flow — organização e acompanhamento de estudos. O Study Flow não
        promete aprovação; ele te dá estrutura, clareza e constância.
      </footer>
    </div>
  );
}
