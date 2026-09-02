import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/marketing/Logo";

export const metadata: Metadata = {
  title: "Política de Privacidade — Nexo Study",
  description:
    "Quais dados o Nexo Study coleta, por que, com quem compartilha e como você pode apagá-los.",
};

const ATUALIZADO_EM = "1º de setembro de 2026";

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Atualizada em {ATUALIZADO_EM}
        </p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-slate-700">
          <p>
            Esta política explica, em português claro, o que o Nexo Study faz com
            os seus dados. Ela vale para o site e para o aplicativo, e segue a
            Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Quem é o responsável
            </h2>
            <p className="mt-3">
              O Nexo Study é operado por Pedro Martins, desenvolvedor
              independente. Para qualquer assunto sobre seus dados — inclusive
              pedidos de acesso, correção ou exclusão — o contato é o e-mail de
              suporte informado no rodapé do site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Que dados coletamos
            </h2>
            <p className="mt-3">Só o necessário para o serviço funcionar:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Cadastro:</strong> e-mail e senha. A senha é guardada
                pelo Firebase Authentication, do Google, de forma criptografada —
                nós nunca a vemos.
              </li>
              <li>
                <strong>Perfil:</strong> nome de exibição e, se você quiser,
                uma foto. A foto fica reduzida e guardada junto com seus dados.
              </li>
              <li>
                <strong>Conteúdo de estudo:</strong> matérias, atividades,
                trabalhos, provas, anotações do caderno, imagens que você anexa
                e sessões do modo foco.
              </li>
              <li>
                <strong>Conversas com o Agente de IA:</strong> as mensagens que
                você troca com o agente, para você poder consultar o histórico.
              </li>
              <li>
                <strong>Assinatura:</strong> plano, situação e data de validade.
              </li>
            </ul>
            <p className="mt-3">
              <strong>O que NÃO coletamos:</strong> dados de cartão de crédito.
              O pagamento acontece inteiramente no ambiente da Cakto — nenhum
              dado financeiro passa pelos nossos servidores. Também não usamos
              rastreadores de publicidade nem vendemos dados a ninguém.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. Por que tratamos esses dados
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Executar o contrato</strong> (art. 7º, V da LGPD):
                manter sua conta, guardar seu conteúdo e liberar o acesso do
                plano que você assinou.
              </li>
              <li>
                <strong>Cumprir obrigação legal</strong> (art. 7º, II): guardar
                o registro das transações de pagamento pelo prazo que a
                legislação fiscal exige.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Com quem compartilhamos
            </h2>
            <p className="mt-3">
              Apenas com os serviços necessários para o produto funcionar, e só
              o mínimo que cada um precisa:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Google (Firebase):</strong> guarda a autenticação e o
                banco de dados.
              </li>
              <li>
                <strong>Google (Gemini):</strong> quando você usa o Agente de IA,
                o texto que você escreve é enviado ao modelo para gerar a
                resposta. Explicado em detalhe no item 5.
              </li>
              <li>
                <strong>Cakto:</strong> processa os pagamentos e nos informa
                apenas que a compra foi aprovada, e para qual e-mail.
              </li>
              <li>
                <strong>Netlify:</strong> hospeda o site.
              </li>
            </ul>
            <p className="mt-3">
              Esses serviços podem processar dados fora do Brasil. Nunca
              compartilhamos seus dados com anunciantes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. O Agente de IA
            </h2>
            <p className="mt-3">
              O Agente de IA, disponível no plano Pro, funciona enviando o texto
              da sua conversa ao <strong>Gemini, modelo de inteligência
              artificial do Google</strong>, que devolve a resposta.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Só é enviado o que você escreve na conversa, junto das últimas
                mensagens dela e dos nomes das suas matérias, para o agente
                entender o contexto.
              </li>
              <li>
                <strong>Não envie dados sensíveis</strong> — documentos, dados
                de saúde, senhas — nas conversas com o agente.
              </li>
              <li>
                O agente pode errar. Confira sempre datas e informações
                importantes antes de confiar nelas.
              </li>
              <li>
                O agente nunca salva nada sozinho: toda tarefa sugerida passa
                pela sua confirmação.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Menores de idade
            </h2>
            <p className="mt-3">
              O Nexo Study atende estudantes, e parte deles é menor de idade. O
              tratamento de dados de crianças e adolescentes é feito no melhor
              interesse deles, como manda o art. 14 da LGPD.
            </p>
            <p className="mt-3">
              <strong>Se você tem menos de 18 anos, use o Nexo Study com o
              conhecimento e o consentimento dos seus pais ou responsáveis.</strong>{" "}
              Responsáveis podem, a qualquer momento, pedir acesso aos dados do
              menor ou a exclusão da conta pelo e-mail de suporte.
            </p>
            <p className="mt-3">
              Não coletamos mais dados de menores do que de qualquer outro
              usuário, e não usamos os dados de ninguém para publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Seus direitos
            </h2>
            <p className="mt-3">
              A LGPD te dá direito de saber o que guardamos, corrigir o que
              estiver errado, levar seus dados embora e apagar tudo. Na prática:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Ver e corrigir:</strong> tudo o que guardamos aparece
                dentro do próprio app, e você edita quando quiser.
              </li>
              <li>
                <strong>Apagar:</strong> em <em>Configurações → Excluir minha
                conta</em>, você apaga a conta e todo o conteúdo de forma
                permanente e imediata, sem precisar pedir a ninguém.
              </li>
              <li>
                <strong>Qualquer outro pedido:</strong> pelo e-mail de suporte.
                Respondemos em até 15 dias.
              </li>
            </ul>
            <p className="mt-3">
              A única exceção à exclusão é o registro das transações de
              pagamento, que a lei fiscal obriga a guardar. Ele contém o e-mail
              e o valor da compra, e nenhum conteúdo de estudo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Segurança e retenção
            </h2>
            <p className="mt-3">
              Seus dados ficam isolados por conta: as regras do banco de dados
              impedem que um usuário alcance o conteúdo de outro, e isso é
              testado. A comunicação com o site é criptografada.
            </p>
            <p className="mt-3">
              Guardamos seus dados enquanto sua conta existir. Se você excluir a
              conta, o conteúdo é apagado na hora.
            </p>
            <p className="mt-3">
              Nenhum sistema é 100% seguro. Se acontecer um incidente que possa
              trazer risco a você, avisaremos os usuários afetados e a Autoridade
              Nacional de Proteção de Dados, como a lei determina.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Mudanças nesta política
            </h2>
            <p className="mt-3">
              Se algo mudar de forma relevante, avisaremos pelo app ou por
              e-mail antes de a mudança valer. A data no topo mostra a última
              atualização.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-slate-200 pt-6 text-sm">
          <Link href="/termos" className="font-medium text-blue-600 hover:text-blue-700">
            Termos de Uso
          </Link>
          <Link href="/" className="font-medium text-slate-600 hover:text-slate-900">
            Voltar ao início
          </Link>
        </div>
      </main>
    </div>
  );
}
