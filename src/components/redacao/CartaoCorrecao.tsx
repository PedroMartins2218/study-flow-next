import type { CorrecaoEnem, MotivoZero } from "@/types/dominio";

// Resultado da correção pela matriz do ENEM.

// Nomes curtos para a tela. A rubrica oficial (em lib/ia/rubricaEnem.ts) usa os
// enunciados completos, que são longos demais para caber num cartão.
const TITULOS: Record<number, string> = {
  1: "Norma culta",
  2: "Compreensão do tema",
  3: "Argumentação",
  4: "Coesão e coerência",
  5: "Proposta de intervenção",
};

const MOTIVOS_ZERO: Record<MotivoZero, string> = {
  fuga_ao_tema: "Fuga ao tema proposto",
  tipo_textual: "Não é um texto dissertativo-argumentativo",
  texto_insuficiente: "Texto insuficiente (até 7 linhas)",
  copia_integral: "Cópia dos textos motivadores",
};

function corDaNota(nota: number): { barra: string; texto: string } {
  if (nota >= 200) return { barra: "bg-emerald-500", texto: "text-emerald-600" };
  if (nota >= 160) return { barra: "bg-blue-500", texto: "text-blue-600" };
  if (nota >= 120) return { barra: "bg-amber-500", texto: "text-amber-600" };
  return { barra: "bg-red-500", texto: "text-red-600" };
}

function Lista({ titulo, itens, cor }: { titulo: string; itens: string[]; cor: string }) {
  if (!itens.length) return null;
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <h3 className="text-sm font-semibold text-slate-900">{titulo}</h3>
      <ul className="mt-2 space-y-1.5">
        {itens.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${cor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CartaoCorrecao({ correcao }: { correcao: CorrecaoEnem }) {
  const { competencias, notaTotal, pontosFortes, proximosPassos, zerada } = correcao;

  return (
    <div className="space-y-4">
      {zerada && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Esta redação seria anulada: {MOTIVOS_ZERO[zerada.motivo]}
          </p>
          <p className="mt-1 text-sm text-red-600">{zerada.explicacao}</p>
          <p className="mt-2 text-xs text-red-500">
            Nota final zero. As competências abaixo mostram o que o texto valeria se
            não fosse anulado — é o que te ajuda a corrigir o rumo.
          </p>
        </div>
      )}

      <div className="rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200/80">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          Nota estimada
        </p>
        <p className="mt-1 text-4xl font-bold text-slate-900">
          {notaTotal}
          <span className="text-lg font-medium text-slate-400"> / 1000</span>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Estimativa de uma IA treinada na matriz oficial. A banca do ENEM tem dois
          corretores humanos e pode divergir.
        </p>
      </div>

      <div className="space-y-2">
        {competencias.map((c) => {
          const cor = corDaNota(c.nota);
          return (
            <div
              key={c.numero}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  C{c.numero} · {TITULOS[c.numero]}
                </h3>
                <span className={`shrink-0 text-sm font-bold ${cor.texto}`}>
                  {c.nota}
                  <span className="text-xs font-medium text-slate-400">/200</span>
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${cor.barra}`}
                  style={{ width: `${(c.nota / 200) * 100}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-600">{c.diagnostico}</p>

              {c.evidencias.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {c.evidencias.map((ev, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-slate-200 pl-3 text-xs text-slate-500 italic"
                    >
                      “{ev}”
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <Lista titulo="O que você acertou" itens={pontosFortes} cor="bg-emerald-500" />
      <Lista titulo="Próximos passos" itens={proximosPassos} cor="bg-blue-500" />
    </div>
  );
}
