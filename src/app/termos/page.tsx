import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/marketing/Logo";
import { PLANOS } from "@/lib/planos";

export const metadata: Metadata = {
  title: "Termos de Uso — Nexo Study",
  description:
    "As regras do serviço: o que o Nexo Study entrega, o que não promete, como funcionam assinatura e cancelamento.",
};

const ATUALIZADO_EM = "1º de setembro de 2026";

export default function TermosPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <header className="border-b border-slate-200 px-6 py-4 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Atualizados em {ATUALIZADO_EM}
        </p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-slate-700">
          <p>
            Ao criar uma conta no Nexo Study você concorda com estas regras.
            Elas estão escritas para serem entendidas, não para confundir.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              1. O que o Nexo Study é
            </h2>
            <p className="mt-3">
              Uma ferramenta de organização e acompanhamento da rotina de
              estudos: matérias, atividades, trabalhos, provas, caderno de
              anotações, modo foco e gráficos de evolução.
            </p>
            <p className="mt-3">
              <strong>O que ele não é:</strong> não é cursinho, não vende aulas
              nem conteúdo didático, e não substitui a escola, o professor ou o
              material que você estuda.
            </p>
            <p className="mt-3">
              <strong>O que ele não promete:</strong> aprovação em prova,
              concurso ou vestibular. O Nexo Study entrega estrutura, clareza e
              constância — o resultado depende do seu estudo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Sua conta
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Você é responsável por manter sua senha em segurança e pelo que
                acontece na sua conta.
              </li>
              <li>
                Use um e-mail que seja realmente seu e ao qual você tenha
                acesso. Ele é o que liga a sua compra à sua conta.
              </li>
              <li>
                <strong>Menores de 18 anos</strong> devem usar o serviço com o
                conhecimento e o consentimento dos pais ou responsáveis.
              </li>
              <li>
                Uma conta é de uso pessoal. Não compartilhe o acesso.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. Planos e pagamento
            </h2>
            <p className="mt-3">Os planos disponíveis:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {PLANOS.map((plano) => (
                <li key={plano.tier}>
                  <strong>{plano.nome}</strong> — {plano.preco}/mês. {plano.resumo}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              A cobrança é mensal e recorrente, processada pela{" "}
              <strong>Cakto</strong>. Nenhum dado de cartão passa pelo Nexo
              Study. O acesso é liberado automaticamente após a confirmação do
              pagamento.
            </p>
            <p className="mt-3">
              Eventuais ofertas especiais, como acesso vitalício, seguem as
              condições informadas na própria oferta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Cancelamento e reembolso
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Sem fidelidade.</strong> Você cancela quando quiser, sem
                multa. O acesso continua até o fim do período que você já pagou.
              </li>
              <li>
                <strong>Arrependimento:</strong> como manda o art. 49 do Código
                de Defesa do Consumidor, você pode desistir da compra em até{" "}
                <strong>7 dias corridos</strong> e receber o valor de volta.
                Basta pedir pelo e-mail de suporte.
              </li>
              <li>
                Em caso de reembolso ou contestação de pagamento, o acesso é
                encerrado imediatamente.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. O Agente de IA
            </h2>
            <p className="mt-3">
              Disponível no plano Pro. Funciona enviando o texto da sua conversa
              ao modelo Gemini, do Google.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>O agente pode errar.</strong> Confira sempre datas,
                prazos e informações importantes antes de confiar nelas.
              </li>
              <li>
                Ele nunca grava nada sozinho: toda sugestão passa pela sua
                confirmação.
              </li>
              <li>
                O uso tem um limite mensal de análises por conta, para manter o
                serviço sustentável.
              </li>
              <li>
                Não use o agente para conteúdo ilegal, ofensivo ou que viole
                direitos de terceiros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Uso aceitável
            </h2>
            <p className="mt-3">Não é permitido:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Tentar acessar dados de outros usuários</li>
              <li>
                Sobrecarregar o serviço de propósito, ou usá-lo de forma
                automatizada para extrair dados
              </li>
              <li>Revender ou compartilhar o acesso</li>
              <li>Enviar conteúdo ilegal ou que viole direitos de terceiros</li>
            </ul>
            <p className="mt-3">
              Contas que descumprirem estas regras podem ser suspensas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Seu conteúdo
            </h2>
            <p className="mt-3">
              O que você escreve e envia continua sendo seu. Nós só guardamos e
              processamos esse conteúdo para o serviço funcionar. Não usamos o
              seu conteúdo para treinar modelos nem o compartilhamos com
              terceiros além do descrito na{" "}
              <Link href="/privacidade" className="text-blue-600 hover:text-blue-700">
                Política de Privacidade
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Disponibilidade e limites
            </h2>
            <p className="mt-3">
              Fazemos o possível para manter o serviço no ar, mas ele pode ficar
              indisponível por manutenção ou por falha de serviços dos quais
              dependemos.
            </p>
            <p className="mt-3">
              <strong>Faça suas próprias cópias do que for importante.</strong>{" "}
              O Nexo Study é uma ferramenta de organização, não um cofre de
              arquivos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Encerramento
            </h2>
            <p className="mt-3">
              Você pode excluir sua conta a qualquer momento em{" "}
              <em>Configurações → Excluir minha conta</em>. A exclusão é
              imediata e permanente: seu conteúdo é apagado e não há como
              recuperar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              10. Mudanças e foro
            </h2>
            <p className="mt-3">
              Se estes termos mudarem de forma relevante, avisaremos antes de a
              mudança valer. Aplica-se a lei brasileira, e fica eleito o foro da
              comarca de Praia Grande, São Paulo.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-sm">
          <Link href="/privacidade" className="font-medium text-blue-600 hover:text-blue-700">
            Política de Privacidade
          </Link>
          <Link href="/" className="font-medium text-slate-600 hover:text-slate-900">
            Voltar ao início
          </Link>
        </div>
      </main>
    </div>
  );
}
