import Link from "next/link";
import { CountdownTimer } from "@/components/marketing/CountdownTimer";
import { Logo } from "@/components/marketing/Logo";
import { ReservaForm } from "@/components/marketing/ReservaForm";
import { Testimonials } from "@/components/marketing/Testimonials";

const FUNCOES = [
  {
    titulo: "Matérias e progresso",
    desc: "Cadastre suas matérias e acompanhe o quanto já avançou em cada uma.",
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
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 2M12 3.75a8.25 8.25 0 108.25 8.25M9.75 3.75h4.5"
      />
    ),
  },
  {
    titulo: "Caderno de estudos",
    desc: "Guarde suas anotações de cada matéria num só lugar, sempre à mão.",
    icone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.862 4.487zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    ),
  },
];

const BENEFICIOS = [
  "Matérias e progresso ilimitados",
  "Atividades e trabalhos organizados por prazo",
  "Provas e simulados com contagem regressiva",
  "Caderno de estudos para suas anotações",
  "Modo foco (Pomodoro) com histórico de sessões",
  "Acesso pelo navegador, no computador ou celular",
];

const BENEFICIOS_ANUAL = [...BENEFICIOS, "Agente de IA próprio (em breve)"];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Topo */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Entrar
            </Link>
            <a
              href="#reservar"
              className="hidden items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 sm:inline-flex"
            >
              Reservar vaga
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h9.19l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-16rem] -z-10 flex justify-center"
        >
          <div className="h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-blue-200 via-sky-200 to-transparent opacity-60 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 pt-16 text-center sm:pt-24">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Organize seus estudos, acompanhe sua evolução e transforme{" "}
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              Garantir minha vaga de fundador
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h9.19l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
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
          <div className="mt-10 flex justify-center">
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* Funções */}
      <section id="funcionalidades" className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Funcionalidades
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Tudo que você precisa para estudar com constância
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Um painel só, sem depender de memória nem de planilhas espalhadas.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FUNCOES.map((f) => (
            <div
              key={f.titulo}
              className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
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

      {/* Para quem é */}
      <Testimonials />

      {/* Planos */}
      <section id="planos" className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Planos
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Preço de fundador
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Condição especial de lançamento, por tempo limitado.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
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
          <div className="relative flex flex-col rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-7 text-white shadow-xl shadow-blue-600/20 ring-1 ring-blue-600 sm:scale-[1.03]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow">
              Mais popular
            </span>
            <h3 className="font-semibold">Fundador anual</h3>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-semibold">
                R$ 59,90<span className="text-base font-normal text-blue-100">/ano</span>
              </span>
              <span className="text-sm text-blue-200 line-through">R$ 118,80</span>
            </p>
            <p className="mt-2 text-sm text-blue-100">
              Só R$ 4,99/mês · você economiza R$ 58,90 no ano (quase 50%) em vez de
              pagar mês a mês.
            </p>
            <ul className="mt-6 flex-1 space-y-3">
              {BENEFICIOS_ANUAL.map((b) => {
                const destaque = b.startsWith("Agente de IA");
                return (
                  <li
                    key={b}
                    className={`flex items-start gap-2 text-sm ${
                      destaque ? "font-semibold text-white" : "text-blue-50"
                    }`}
                  >
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
                );
              })}
            </ul>
            <a
              href="#reservar"
              className="mt-7 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Quero o anual
            </a>
          </div>
        </div>
      </section>

      {/* Reserva */}
      <section id="reservar" className="bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-md px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Reserve seu acesso agora
          </h2>
          <p className="mt-2 mb-6 text-center text-sm text-slate-500">
            Deixe seus dados e garanta a condição de fundador. Quando o acesso
            abrir, você recebe o link para assinar. Nada é cobrado agora.
          </p>
          <ReservaForm />
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
          <Logo />
          <p className="max-w-xl text-xs text-slate-400">
            Study Flow — organização e acompanhamento de estudos. O Study Flow não
            promete aprovação; ele te dá estrutura, clareza e constância.
          </p>
        </div>
      </footer>
    </div>
  );
}
