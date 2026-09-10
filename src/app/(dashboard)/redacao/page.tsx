"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth/AuthProvider";
import { criarRedacao, removerRedacao, subscribeToRedacoes } from "@/lib/data/redacoes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Botao } from "@/components/ui/Botao";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icone } from "@/components/ui/Icone";
import { CardsSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { CartaoCorrecao } from "@/components/redacao/CartaoCorrecao";
import { CartaoAutenticidade } from "@/components/redacao/CartaoAutenticidade";
import { EditorRedacao, useRastreioProveniencia } from "@/components/redacao/EditorRedacao";
import { ENTIDADES } from "@/lib/ui/entidades";
import { dataLocalISO, formatarDataCurta } from "@/lib/ui/datas";
import { useTemaEscuro } from "@/lib/ui/useTemaEscuro";
import type { CorrecaoEnem, Proveniencia, Redacao, ResultadoPlagio } from "@/types/dominio";

type Vista = "lista" | "editor" | "resultado";

interface Resultado {
  correcao: CorrecaoEnem;
  plagio: ResultadoPlagio;
  proveniencia: Proveniencia;
  tema: string;
}

function tomDaNota(nota: number) {
  if (nota >= 800) return "sucesso" as const;
  if (nota >= 600) return "info" as const;
  if (nota >= 400) return "alerta" as const;
  return "perigo" as const;
}

export default function RedacaoPage() {
  const { user } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const escuro = useTemaEscuro();
  const rastreio = useRastreioProveniencia();

  const [redacoes, setRedacoes] = useState<Redacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [temAcesso, setTemAcesso] = useState<boolean | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);

  const [vista, setVista] = useState<Vista>("lista");
  const [tema, setTema] = useState("");
  const [textoMotivador, setTextoMotivador] = useState("");
  const [texto, setTexto] = useState("");
  const [motivadorAberto, setMotivadorAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToRedacoes(user.uid, (lista) => {
      setRedacoes(lista);
      setCarregando(false);
    });
  }, [user]);

  // Plano e cota vêm do servidor — o cliente não decide isso.
  useEffect(() => {
    if (!user) return;
    let cancelado = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const resp = await fetch("/api/ia/redacao", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dados = await resp.json();
        if (cancelado) return;
        setTemAcesso(Boolean(dados.temAcesso));
        if (dados.temAcesso) setRestantes(dados.restantes ?? null);
      } catch {
        if (!cancelado) setTemAcesso(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [user]);

  // Evolução da nota ao longo do tempo. A lista vem do mais novo para o mais
  // velho e o gráfico lê ao contrário.
  const evolucao = useMemo(
    () =>
      [...redacoes]
        .reverse()
        .filter((r) => r.criadoEm)
        .map((r) => ({
          dia: formatarDataCurta(dataLocalISO(new Date(r.criadoEm as string))),
          nota: r.correcao.notaTotal,
        })),
    [redacoes]
  );

  function novaRedacao() {
    setTema("");
    setTextoMotivador("");
    setTexto("");
    setMotivadorAberto(false);
    setErro("");
    setResultado(null);
    rastreio.reiniciar();
    setVista("editor");
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!user || enviando) return;

    setErro("");
    setEnviando(true);

    const proveniencia = rastreio.capturar();

    try {
      const token = await user.getIdToken();
      const resp = await fetch("/api/ia/redacao", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tema, texto, textoMotivador, proveniencia }),
      });
      const dados = await resp.json();

      if (!resp.ok) {
        setErro(dados.erro ?? "Não foi possível corrigir agora.");
        return;
      }

      // Grava do cliente, como nas outras entidades. Se a gravação falhar, o
      // resultado ainda aparece na tela: o aluno não pode perder a correção
      // que acabou de custar uma análise da cota.
      try {
        await criarRedacao(user.uid, {
          tema,
          texto,
          textoMotivador,
          correcao: dados.correcao,
          plagio: dados.plagio,
          proveniencia,
        });
      } catch (erroGravacao) {
        console.error("[redacao] falha ao salvar:", erroGravacao);
        toast("Correção pronta, mas não deu para salvar no histórico", "erro");
      }

      if (typeof dados.restantes === "number") setRestantes(dados.restantes);
      setResultado({
        correcao: dados.correcao,
        plagio: dados.plagio,
        proveniencia,
        tema,
      });
      setVista("resultado");
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function apagar(r: Redacao) {
    if (!user) return;
    const ok = await confirmar({
      titulo: "Apagar esta redação?",
      descricao: "A redação e a correção dela serão removidas.",
      confirmar: "Apagar",
      perigo: true,
    });
    if (!ok) return;
    await removerRedacao(user.uid, r.id);
    toast("Redação apagada");
  }

  function abrirRedacao(r: Redacao) {
    setResultado({
      correcao: r.correcao,
      plagio: r.plagio,
      proveniencia: r.proveniencia,
      tema: r.tema,
    });
    setVista("resultado");
  }

  if (temAcesso === null) {
    return (
      <div className="flex justify-center py-10">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  // Conta Base vê o que ganharia — sem esconder a funcionalidade.
  if (!temAcesso) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-center text-white shadow-lg">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Icone nome="redacao" className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Corrija sua redação pelo ENEM</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-blue-100">
            Nota nas cinco competências, com os trechos da sua redação que justificam
            cada uma. Mais a checagem de cópia dos textos motivadores e o registro de
            como o texto foi escrito.
          </p>
          <Link
            href="/assinatura"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Conhecer o plano Pro
          </Link>
        </div>
      </div>
    );
  }

  if (vista === "resultado" && resultado) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          titulo="Correção"
          subtitulo={resultado.tema}
          acao={
            <Botao variante="secundario" onClick={() => setVista("lista")}>
              Voltar
            </Botao>
          }
        />
        <div className="animate-in space-y-4">
          <CartaoCorrecao correcao={resultado.correcao} />
          <CartaoAutenticidade
            plagio={resultado.plagio}
            proveniencia={resultado.proveniencia}
            indiciosIa={resultado.correcao.indiciosIa}
          />
        </div>
      </div>
    );
  }

  if (vista === "editor") {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          titulo="Nova redação"
          subtitulo="Corrigida pelas cinco competências do ENEM."
          acao={
            <Botao variante="secundario" onClick={() => setVista("lista")} disabled={enviando}>
              Cancelar
            </Botao>
          }
        />

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Tema da redação
            </label>
            <input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              maxLength={300}
              required
              placeholder="Ex.: Desafios para a valorização de comunidades e povos tradicionais no Brasil"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            {!motivadorAberto ? (
              <button
                type="button"
                onClick={() => setMotivadorAberto(true)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                + Colar os textos motivadores (opcional)
              </button>
            ) : (
              <>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Textos motivadores
                </label>
                <textarea
                  value={textoMotivador}
                  onChange={(e) => setTextoMotivador(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder="Cole aqui os textos de apoio da proposta..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Com eles dá para medir quanto da sua redação é cópia dos textos de
                  apoio, que é o que mais derruba nota na C2 e na C3.
                </p>
              </>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Sua redação</label>
            <EditorRedacao
              valor={texto}
              onChange={setTexto}
              rastreio={rastreio}
              desabilitado={enviando}
            />
          </div>

          {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {restantes !== null && `${restantes} análises de IA restantes este mês`}
            </span>
            <Botao type="submit" disabled={enviando || texto.trim().length < 50}>
              {enviando ? "Corrigindo..." : "Corrigir redação"}
            </Botao>
          </div>

          {enviando && (
            <p className="text-center text-xs text-slate-500">
              Lendo as cinco competências e conferindo cópia. Leva alguns segundos.
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        titulo="Redação"
        subtitulo="Sua nota nas cinco competências do ENEM, redação a redação."
        acao={
          <Botao icone="redacao" onClick={novaRedacao}>
            Nova redação
          </Botao>
        }
      />

      {carregando ? (
        <CardsSkeleton />
      ) : redacoes.length === 0 ? (
        <EmptyState
          titulo="Nenhuma redação corrigida ainda"
          descricao="Escreva uma redação e receba a nota por competência, com os trechos que justificam cada uma."
          acao={<Botao onClick={novaRedacao}>Corrigir minha primeira redação</Botao>}
        />
      ) : (
        <div className="animate-in space-y-6">
          {evolucao.length >= 2 && (
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Evolução da nota</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucao} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={escuro ? "#334155" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="dia"
                      tick={{ fontSize: 11, fill: escuro ? "#94a3b8" : "#64748b" }}
                      axisLine={{ stroke: escuro ? "#334155" : "#e2e8f0" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 1000]}
                      tick={{ fontSize: 11, fill: escuro ? "#94a3b8" : "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: escuro ? "#1e293b" : "#fff",
                        border: `1px solid ${escuro ? "#334155" : "#e2e8f0"}`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: escuro ? "#94a3b8" : "#64748b",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nota"
                      name="Nota"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#f43f5e" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {redacoes.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
              >
                <button
                  type="button"
                  onClick={() => abrirRedacao(r)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ENTIDADES.redacao.chip}`}
                  >
                    <Icone nome="redacao" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {r.tema}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {r.criadoEm
                        ? formatarDataCurta(dataLocalISO(new Date(r.criadoEm)))
                        : "agora"}
                      {r.plagio.percentual > 0 && ` · ${r.plagio.percentual}% copiado`}
                    </span>
                  </span>
                </button>

                <Badge tom={tomDaNota(r.correcao.notaTotal)}>{r.correcao.notaTotal}</Badge>

                <button
                  type="button"
                  onClick={() => apagar(r)}
                  aria-label="Apagar redação"
                  className="shrink-0 text-slate-400 transition hover:text-red-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
