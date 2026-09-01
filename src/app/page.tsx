import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";
import { Testimonials } from "@/components/marketing/Testimonials";
import { PLANOS } from "@/lib/planos";
import dashboardPreview from "../../public/marketing/dashboard-preview.png";

const DORES = [
  {
    titulo: "Informação espalhada",
    desc: "Prazo no grupo do WhatsApp, matéria no caderno, prova na agenda do celular. Nada conversa entre si.",
    icone: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" opacity={0.35} />
      </>
    ),
  },
  {
    titulo: "Sem visão de progresso",
    desc: "Difícil saber se você está evoluindo de verdade ou só girando em torno das mesmas matérias.",
    icone: <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10M10 20V4M16 20v7M4 20h16" />,
  },
  {
    titulo: "Foco que não rende",
    desc: "Você senta pra estudar, mas sem ciclo, sem meta e sem registro, o tempo passa e falta a sensação de progresso.",
    icone: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

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

const PERGUNTAS = [
  {
    q: "Preciso de cartão de crédito?",
    a: "O pagamento é feito com segurança direto no checkout da Cakto, que aceita cartão e outras formas de pagamento disponíveis por lá. O Nexo Study não coleta nem armazena dados de pagamento.",
  },
  {
    q: "Qual a diferença entre o Base e o Pro?",
    a: "O Base tem todas as ferramentas de organização: matérias, atividades, trabalhos, provas, caderno, modo foco e gráficos. O Pro inclui tudo isso e mais o Agente de IA, que lê um texto (plano de ensino, edital, recado do professor) e transforma em tarefas e provas já agendadas, para você só revisar e salvar.",
  },
  {
    q: "Posso trocar de plano depois?",
    a: "Sim. Você pode começar no Base e migrar para o Pro quando quiser o Agente de IA — e o contrário também vale.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. A assinatura é mensal e sem fidelidade — você cancela quando quiser, sem multa e sem burocracia.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. O Nexo Study funciona direto pelo navegador, no computador ou no celular, sem precisar instalar nada.",
  },
  {
    q: "É cursinho ou tem aulas?",
    a: "Não. O Nexo Study não é cursinho e não vende aulas ou conteúdo. É uma ferramenta de organização e acompanhamento da sua rotina de estudos, para usar junto do material que você já estuda.",
  },
  {
    q: "Em quanto tempo tenho acesso após assinar?",
    a: "Você cria sua conta em segundos e, após a confirmação do pagamento no checkout da Cakto, seu acesso é liberado automaticamente.",
  },
];

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
              href="#planos"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Assinar agora
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
        <div className="mx-auto w-full max-w-3xl px-6 pt-6 text-center sm:pt-8">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Organize seus estudos, acompanhe sua evolução e transforme{" "}
            <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              foco em resultado
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
            Matérias, atividades, trabalhos, provas e foco num só lugar. Chega
            de depender da memória ou de planilhas espalhadas — assine e
            comece a estudar com constância hoje mesmo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#planos"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              Assinar agora — a partir de R$ 29,90/mês
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
          <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>Cancele quando quiser</span>
            <span className="text-slate-300">·</span>
            <span>Acesso liberado na hora</span>
            <span className="text-slate-300">·</span>
            <span>Direto no navegador, sem instalar nada</span>
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-3xl px-6 sm:mt-14">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
            <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            </div>
            <Image
              src={dashboardPreview}
              alt="Dashboard do Nexo Study com resumo de matérias, atividades, trabalhos e foco do dia"
              priority
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Dores */}
      <section className="mt-16 bg-slate-50/70 py-16 sm:mt-24 sm:py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              O problema
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Estudar sem organização cansa o dobro
            </h2>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              Não é falta de esforço — é falta de estrutura. O Nexo Study
              existe para resolver exatamente isso.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {DORES.map((d) => (
              <div
                key={d.titulo}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="h-6 w-6"
                  >
                    {d.icone}
                  </svg>
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{d.titulo}</h3>
                <p className="mt-1 text-sm text-slate-600">{d.desc}</p>
              </div>
            ))}
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
      <section id="planos" className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Planos
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Escolha como quer estudar
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Sem fidelidade e sem letra miúda. Cancele quando quiser.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANOS.map((plano) => {
            const ehPro = plano.tier === "pro";
            return (
              <div
                key={plano.tier}
                className={`flex flex-col rounded-2xl p-7 shadow-sm ring-1 ${
                  ehPro
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/20 ring-blue-600"
                    : "bg-white text-slate-900 ring-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">Nexo Study {plano.nome}</h3>
                  {plano.destaque && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        ehPro ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {plano.destaque}
                    </span>
                  )}
                </div>

                <p className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold">{plano.preco}</span>
                  <span
                    className={`text-base font-normal ${ehPro ? "text-blue-100" : "text-slate-500"}`}
                  >
                    /mês
                  </span>
                </p>
                <p className={`mt-2 text-sm ${ehPro ? "text-blue-100" : "text-slate-600"}`}>
                  {plano.resumo}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plano.beneficios.map((b) => (
                    <li
                      key={b}
                      className={`flex items-start gap-2 text-sm ${
                        ehPro ? "text-blue-50" : "text-slate-600"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          ehPro ? "text-white" : "text-blue-600"
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>

                {plano.checkoutUrl ? (
                  <a
                    href={plano.checkoutUrl}
                    className={`mt-7 inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition ${
                      ehPro
                        ? "bg-white text-blue-700 hover:bg-blue-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Assinar {plano.nome}
                  </a>
                ) : (
                  <p
                    className={`mt-7 rounded-lg px-3 py-2.5 text-center text-xs ${
                      ehPro ? "bg-white/10 text-blue-50" : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    Link de assinatura em configuração.
                  </p>
                )}
                <p
                  className={`mt-3 text-center text-xs ${
                    ehPro ? "text-blue-100/80" : "text-slate-400"
                  }`}
                >
                  {plano.porDia} · cancele quando quiser
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-2xl px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Dúvidas
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Perguntas frequentes
            </h2>
          </div>
          <div className="mt-10 flex flex-col gap-3">
            {PERGUNTAS.map((p) => (
              <details
                key={p.q}
                className="group rounded-2xl bg-white px-5 shadow-sm ring-1 ring-slate-200"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-semibold text-slate-900">
                  {p.q}
                  <span className="shrink-0 text-lg text-blue-600 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-slate-600">{p.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-14 text-center text-white shadow-xl shadow-blue-600/20 sm:px-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Comece a organizar seus estudos hoje
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-blue-100 sm:text-base">
            Estrutura, clareza e constância — a partir de R$ 29,90/mês, você tem
            acesso ao Nexo Study agora mesmo.
          </p>
          <a
            href="#planos"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Ver planos
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h9.19l-3.72-3.72a.75.75 0 111.06-1.06l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06l3.72-3.72H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
          <Logo />
          <p className="max-w-xl text-xs text-slate-400">
            Nexo Study — organização e acompanhamento de estudos. O Nexo Study não
            promete aprovação; ele te dá estrutura, clareza e constância.
          </p>
        </div>
      </footer>
    </div>
  );
}
