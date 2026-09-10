import { Badge } from "@/components/ui/Badge";
import type { IndiciosIa, Proveniencia, ResultadoPlagio } from "@/types/dominio";

// Relatório de autenticidade — três sinais SEPARADOS, de confiabilidade bem
// diferente, deliberadamente não fundidos num número só:
//
//  1. Cópia — aritmética verificável (sobreposição de n-gramas). É o único
//     percentual da tela, porque é o único que significa alguma coisa.
//  2. Proveniência — fato registrado no editor: digitado ou colado.
//  3. Indícios estilísticos — leitura da IA, falível, exibida como indício.
//
// Não existe "% de IA" aqui de propósito: esse número não teria como ser
// calculado e daria ao aluno uma certeza que ninguém tem.

function Secao({
  titulo,
  children,
  destaque,
}: {
  titulo: string;
  children: React.ReactNode;
  destaque?: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 p-4 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{titulo}</h3>
        {destaque}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function tomDoPlagio(pct: number) {
  if (pct >= 40) return "perigo" as const;
  if (pct >= 15) return "alerta" as const;
  return "sucesso" as const;
}

const ROTULO_ORIGEM = {
  digitado: { texto: "Digitado aqui", tom: "sucesso" as const },
  misto: { texto: "Parcialmente colado", tom: "alerta" as const },
  colado: { texto: "Colado de fora", tom: "alerta" as const },
};

const ROTULO_INDICIOS = {
  baixo: { texto: "Indícios baixos", tom: "sucesso" as const },
  medio: { texto: "Indícios médios", tom: "alerta" as const },
  alto: { texto: "Indícios altos", tom: "alerta" as const },
};

function formatarDuracao(segundos: number): string {
  if (segundos < 60) return `${segundos}s`;
  const min = Math.floor(segundos / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60}min`;
}

export function CartaoAutenticidade({
  plagio,
  proveniencia,
  indiciosIa,
}: {
  plagio: ResultadoPlagio;
  proveniencia: Proveniencia;
  indiciosIa: IndiciosIa;
}) {
  const origem = ROTULO_ORIGEM[proveniencia.origem];
  const indicios = ROTULO_INDICIOS[indiciosIa.nivel];

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Autenticidade</h2>
      </div>

      <Secao
        titulo="Trechos copiados"
        destaque={<Badge tom={tomDoPlagio(plagio.percentual)}>{plagio.percentual}%</Badge>}
      >
        {plagio.trechos.length === 0 ? (
          <p className="text-sm text-slate-600">
            Nenhum trecho copiado dos textos motivadores ou das suas redações anteriores.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {plagio.percentual}% do texto reproduz trechos de outra fonte. No ENEM,
              copiar os textos motivadores limita a nota da C2 e derruba a C3.
            </p>
            <ul className="mt-2 space-y-2">
              {plagio.trechos.map((t, i) => (
                <li key={i} className="rounded-lg bg-red-50 p-2.5">
                  <p className="text-xs text-red-700 italic">“{t.texto}”</p>
                  <p className="mt-1 text-xs font-medium text-red-500">{t.fonte}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Secao>

      <Secao titulo="Como o texto chegou aqui" destaque={<Badge tom={origem.tom}>{origem.texto}</Badge>}>
        <p className="text-sm text-slate-600">
          {proveniencia.caracteresDigitados.toLocaleString("pt-BR")} caracteres digitados
          {proveniencia.caracteresColados > 0 && (
            <>
              {" e "}
              {proveniencia.caracteresColados.toLocaleString("pt-BR")} colados em{" "}
              {proveniencia.eventosColagem}{" "}
              {proveniencia.eventosColagem === 1 ? "vez" : "vezes"}
            </>
          )}
          , em {formatarDuracao(proveniencia.tempoEdicaoSegundos)} de escrita.
        </p>
        {proveniencia.origem !== "digitado" && (
          <p className="mt-2 text-xs text-slate-500">
            Colar não quer dizer que o texto não é seu — quem escreve no Word e cola
            aparece assim também. É só o registro de como ele entrou.
          </p>
        )}
      </Secao>

      <Secao
        titulo="Indícios de escrita por IA"
        destaque={<Badge tom={indicios.tom}>{indicios.texto}</Badge>}
      >
        {indiciosIa.sinais.length > 0 ? (
          <ul className="space-y-1.5">
            {indiciosIa.sinais.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">
            Nenhuma característica estilística chamou atenção.
          </p>
        )}
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
          Isto é indício, não veredito. Detectores de escrita por IA erram com
          frequência, nos dois sentidos — texto humano bem escrito costuma disparar
          alerta, e texto de IA revisado costuma passar. Use como espelho do seu
          próprio estilo, nunca como prova.
        </p>
      </Secao>
    </div>
  );
}
