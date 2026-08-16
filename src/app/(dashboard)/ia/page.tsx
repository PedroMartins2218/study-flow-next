"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Icone } from "@/components/ui/Icone";
import { CartaoTarefas } from "@/components/ia/CartaoTarefas";
import { subscribeToMaterias } from "@/lib/data/materias";
import {
  adicionarMensagem,
  criarConversa,
  removerConversa,
  subscribeToConversas,
  subscribeToMensagens,
  tituloDaPrimeiraMensagem,
  type Conversa,
  type Mensagem,
} from "@/lib/data/conversas";
import type { Materia } from "@/types/studyflow";
import type { TarefaExtraida } from "@/lib/validators/studyflow";

const SUGESTOES = [
  "Me ajuda a montar um plano de estudos para as provas deste mês",
  "Explica a diferença entre mitose e meiose",
  "Tenho prova de história dia 20 e trabalho de física dia 25",
  "Resume este texto pra mim: ",
];

/** Mensagem ainda não gravada (a que está sendo digitada/respondida). */
interface MensagemLocal {
  id: string;
  papel: "usuario" | "assistente";
  texto: string;
  tarefas?: TarefaExtraida[];
  pendente?: boolean;
}

/**
 * Só respostas com algum corpo ganham o botão de PDF. Um "E aí, como posso
 * ajudar?" com botão de download ao lado seria ruído.
 */
const MINIMO_PARA_PDF = 200;

/** Conteúdo mandado para a impressão. O `id` força o efeito a rodar de novo
 *  quando a mesma mensagem é impressa duas vezes. */
interface ParaImprimir {
  id: number;
  titulo: string;
  texto: string;
}

/**
 * Formata o texto da resposta para o papel: linhas que começam com hífen viram
 * lista, o resto vira parágrafo. Sem isso o PDF sairia como um bloco corrido.
 */
function BlocosImpressao({ texto }: { texto: string }) {
  const blocos: React.ReactNode[] = [];
  let itens: string[] = [];

  const fecharLista = (chave: string) => {
    if (!itens.length) return;
    blocos.push(
      <ul key={`lista-${chave}`} style={{ paddingLeft: "18pt", margin: "4pt 0" }}>
        {itens.map((item, i) => (
          <li key={i} style={{ marginBottom: 3 }}>
            {item}
          </li>
        ))}
      </ul>
    );
    itens = [];
  };

  texto.split("\n").forEach((linha, i) => {
    const limpa = linha.trim();
    if (/^[-•*]\s+/.test(limpa)) {
      itens.push(limpa.replace(/^[-•*]\s+/, ""));
      return;
    }
    fecharLista(String(i));
    if (limpa) {
      blocos.push(
        <p key={`p-${i}`} style={{ margin: "6pt 0" }}>
          {limpa}
        </p>
      );
    }
  });
  fecharLista("fim");

  return <>{blocos}</>;
}

export default function AgenteIaPage() {
  const { user } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();

  const [temAcesso, setTemAcesso] = useState<boolean | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [locais, setLocais] = useState<MensagemLocal[]>([]);

  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [erro, setErro] = useState("");
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [listaAberta, setListaAberta] = useState(false);
  const [paraImprimir, setParaImprimir] = useState<ParaImprimir | null>(null);

  const fimRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToMaterias(user.uid, setMaterias);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeToConversas(user.uid, setConversas);
  }, [user]);

  // Mensagens da conversa aberta. Quando o Firestore confirma, as locais somem.
  useEffect(() => {
    if (!user || !conversaAtiva) return;
    return subscribeToMensagens(user.uid, conversaAtiva, (lista) => {
      setMensagens(lista);
      setLocais([]);
    });
  }, [user, conversaAtiva]);

  // Plano e cota vêm do servidor — o cliente não decide isso.
  useEffect(() => {
    if (!user) return;
    let cancelado = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const resp = await fetch("/api/ia/chat", {
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

  // Sem conversa aberta não há histórico a mostrar — derivado, e não limpo por
  // efeito, para não disparar renderização em cascata.
  const visiveis: MensagemLocal[] = [
    ...(conversaAtiva ? mensagens : []).map((m) => ({
      id: m.id,
      papel: m.papel,
      texto: m.texto,
      tarefas: m.tarefas,
    })),
    ...locais,
  ];

  // Rola para o fim a cada mensagem nova.
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visiveis.length, pensando]);

  // Abre o diálogo de impressão depois que o bloco #impressao já foi montado.
  // Um respiro de um frame evita imprimir a página antes do conteúdo entrar.
  useEffect(() => {
    if (!paraImprimir) return;
    const t = setTimeout(() => window.print(), 80);
    return () => clearTimeout(t);
  }, [paraImprimir]);

  const ajustarAltura = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, []);

  async function enviar() {
    const pergunta = texto.trim();
    if (!user || !pergunta || pensando) return;

    setErro("");
    setTexto("");
    setPensando(true);
    // Devolve o campo ao tamanho de uma linha.
    requestAnimationFrame(() => {
      if (areaRef.current) areaRef.current.style.height = "auto";
    });

    // Mostra a pergunta na hora, antes de qualquer ida ao servidor.
    const idLocal = `local-${Date.now()}`;
    setLocais([{ id: idLocal, papel: "usuario", texto: pergunta, pendente: true }]);

    // Histórico que vai ao modelo (inclui a pergunta recém-digitada).
    const historico = [
      ...visiveis.map((m) => ({ papel: m.papel, texto: m.texto })),
      { papel: "usuario" as const, texto: pergunta },
    ];

    try {
      let conversaId = conversaAtiva;
      if (!conversaId) {
        conversaId = await criarConversa(user.uid, tituloDaPrimeiraMensagem(pergunta));
        setConversaAtiva(conversaId);
      }

      await adicionarMensagem(user.uid, conversaId, { papel: "usuario", texto: pergunta });

      const token = await user.getIdToken();
      const resp = await fetch("/api/ia/chat", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagens: historico,
          materias: materias.map((m) => m.nome),
        }),
      });
      const dados = await resp.json();

      if (!resp.ok) {
        setErro(dados.erro ?? "Não foi possível responder agora.");
        return;
      }

      await adicionarMensagem(user.uid, conversaId, {
        papel: "assistente",
        texto: dados.resposta,
        tarefas: dados.tarefas,
      });

      if (typeof dados.restantes === "number") setRestantes(dados.restantes);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setPensando(false);
    }
  }

  function novaConversa() {
    setConversaAtiva(null);
    setMensagens([]);
    setLocais([]);
    setErro("");
    setListaAberta(false);
    areaRef.current?.focus();
  }

  async function apagarConversa(c: Conversa) {
    if (!user) return;
    const ok = await confirmar({
      titulo: `Apagar “${c.titulo}”?`,
      descricao: "A conversa e todas as mensagens serão removidas.",
      confirmar: "Apagar",
      perigo: true,
    });
    if (!ok) return;
    await removerConversa(user.uid, c.id);
    if (conversaAtiva === c.id) novaConversa();
    toast("Conversa apagada");
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
            <Icone nome="ia" className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Converse com o Agente de IA</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-blue-100">
            Tire dúvidas de matéria, peça resumos e monte seu plano de estudos conversando.
            Quando você contar sobre uma prova ou trabalho, ele já agenda para você confirmar.
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

  const listaConversas = (
    <div className="flex h-full flex-col">
      <button
        onClick={novaConversa}
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
        Nova conversa
      </button>

      <div className="mt-3 flex-1 overflow-y-auto">
        {conversas.length === 0 ? (
          <p className="px-1 py-4 text-xs text-slate-400">
            Suas conversas aparecem aqui para você voltar quando quiser.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversas.map((c) => (
              <li key={c.id} className="group relative">
                <button
                  onClick={() => {
                    setConversaAtiva(c.id);
                    setLocais([]);
                    setErro("");
                    setListaAberta(false);
                  }}
                  className={`w-full truncate rounded-lg py-2 pl-2.5 pr-8 text-left text-sm transition ${
                    conversaAtiva === c.id
                      ? "bg-blue-50 font-medium text-blue-800"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c.titulo}
                </button>
                <button
                  onClick={() => apagarConversa(c)}
                  aria-label={`Apagar ${c.titulo}`}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    // Ocupa a altura da área de conteúdo para o campo de escrita ficar fixo embaixo.
    <div className="flex h-[calc(100vh-9rem)] gap-5 sm:h-[calc(100vh-7rem)]">
      {/* Lista de conversas (desktop) */}
      <aside className="hidden w-60 shrink-0 lg:block">{listaConversas}</aside>

      {/* Gaveta de conversas (celular) */}
      {listaAberta && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setListaAberta(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Conversas</h2>
              <button
                onClick={() => setListaAberta(false)}
                aria-label="Fechar"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-3rem)]">{listaConversas}</div>
          </div>
        </div>
      )}

      {/* Conversa */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={() => setListaAberta(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 lg:hidden"
            aria-label="Ver conversas"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">
            {conversas.find((c) => c.id === conversaAtiva)?.titulo ?? "Agente de IA"}
          </h1>
          {restantes !== null && (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium tabular-nums text-slate-600">
              {restantes} restantes
            </span>
          )}
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          {visiveis.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-2 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icone nome="ia" className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-semibold text-slate-900">Como posso ajudar?</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Pergunte sobre a matéria, peça um resumo ou me conte seus prazos que eu organizo.
              </p>
              <div className="mt-5 flex w-full max-w-md flex-col gap-2">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setTexto(s);
                      areaRef.current?.focus();
                      requestAnimationFrame(ajustarAltura);
                    }}
                    className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-left text-sm text-slate-600 transition hover:border-blue-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visiveis.map((m) =>
                m.papel === "usuario" ? (
                  <div key={m.id} className="flex justify-end">
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm text-white ${
                        m.pendente ? "opacity-70" : ""
                      }`}
                    >
                      {m.texto}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icone nome="ia" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 max-w-[85%]">
                      <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-md bg-slate-100 px-4 py-2.5 text-sm text-slate-800">
                        {m.texto}
                      </div>

                      {/* Respostas longas (resumos, planos de estudo) valem um PDF. */}
                      {m.texto.length >= MINIMO_PARA_PDF && (
                        <button
                          onClick={() =>
                            setParaImprimir({
                              id: Date.now(),
                              titulo:
                                conversas.find((c) => c.id === conversaAtiva)?.titulo ??
                                "Conversa com o Agente",
                              texto: m.texto,
                            })
                          }
                          className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                          </svg>
                          Baixar PDF
                        </button>
                      )}

                      {m.tarefas && m.tarefas.length > 0 && (
                        <CartaoTarefas tarefas={m.tarefas} />
                      )}
                    </div>
                  </div>
                )
              )}

              {pensando && (
                <div className="flex gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icone nome="ia" className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3">
                    {[0, 150, 300].map((atraso) => (
                      <span
                        key={atraso}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: `${atraso}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={fimRef} />
            </div>
          )}
        </div>

        {erro && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
        )}

        {/* Campo de escrita */}
        <div className="mt-3 flex items-end gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-500">
          <textarea
            ref={areaRef}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              ajustarAltura();
            }}
            onKeyDown={(e) => {
              // Enter envia; Shift+Enter quebra linha, como nos chats.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            rows={1}
            maxLength={8000}
            placeholder="Escreva sua mensagem..."
            className="max-h-44 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm outline-none"
          />
          <button
            onClick={enviar}
            disabled={pensando || !texto.trim()}
            aria-label="Enviar mensagem"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-slate-400">
          O agente pode errar. Confira datas e informações importantes.
        </p>
      </div>

      {/* Versão só para impressão — escondida na tela (ver globals.css) */}
      {paraImprimir && (
        <div id="impressao">
          <h1 style={{ fontWeight: 700, marginBottom: 4 }}>{paraImprimir.titulo}</h1>
          <p style={{ fontSize: "10pt", color: "#555", marginBottom: 18 }}>
            Gerado pelo Agente de IA do Study Flow
          </p>
          <BlocosImpressao texto={paraImprimir.texto} />
        </div>
      )}
    </div>
  );
}
