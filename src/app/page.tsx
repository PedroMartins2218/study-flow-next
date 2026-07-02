import Link from "next/link";
import { ReservaForm } from "@/components/marketing/ReservaForm";

const FUNCOES = [
  {
    titulo: "Matérias e progresso",
    desc: "Cadastre suas matérias e acompanhe o quanto já avançou em cada uma.",
  },
  {
    titulo: "Atividades e trabalhos",
    desc: "Saiba o que fazer hoje e o que está atrasado, sem depender da memória.",
  },
  {
    titulo: "Provas e simulados",
    desc: "Tenha as datas importantes sempre à vista e organize a preparação.",
  },
  {
    titulo: "Modo foco (Pomodoro)",
    desc: "Estude em ciclos de foco e registre suas sessões automaticamente.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Topo */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-lg font-semibold text-slate-900">Study Flow</span>
        <Link
          href="/login"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-3xl px-6 pt-8 text-center sm:pt-16">
        <span className="inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          Acesso de fundador em pré-lançamento
        </span>
        <h1 className="mt-5 text-3xl font-semibold text-slate-900 sm:text-5xl">
          Organize seus estudos, acompanhe sua evolução e transforme foco em
          resultado.
        </h1>
        <p className="mt-4 text-base text-slate-600 sm:text-lg">
          O Study Flow é o painel do estudante: matérias, atividades, trabalhos,
          provas e foco num só lugar. Simples, direto e feito para quem precisa
          de constância — não é mais um cursinho, é a sua organização.
        </p>
        <a
          href="#reservar"
          className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Garantir minha vaga de fundador
        </a>
      </section>

      {/* Funções */}
      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FUNCOES.map((f) => (
            <div
              key={f.titulo}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <h3 className="font-semibold text-slate-900">{f.titulo}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-8">
        <h2 className="text-center text-2xl font-semibold text-slate-900">
          Preço de fundador
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Condição especial de lançamento, por tempo limitado.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="font-semibold text-slate-900">Fundador mensal</h3>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              R$ 9,90
              <span className="text-base font-normal text-slate-500">/mês</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Acesso a tudo, cancele quando quiser.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <h3 className="font-semibold">Fundador anual</h3>
            <p className="mt-2 text-3xl font-semibold">
              R$ 97<span className="text-base font-normal text-slate-300">/ano</span>
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Economize pagando uma vez por ano.
            </p>
          </div>
        </div>
      </section>

      {/* Reserva */}
      <section id="reservar" className="mx-auto w-full max-w-md px-6 py-16">
        <h2 className="text-center text-2xl font-semibold text-slate-900">
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
