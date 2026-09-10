"use client";

import { useCallback, useRef } from "react";
import type { OrigemTexto, Proveniencia } from "@/types/dominio";

// Editor da redação com rastreio de proveniência.
//
// A pergunta "isso foi escrito por IA?" não tem resposta confiável por análise
// do texto pronto — detectores erram muito e um falso positivo acusa o aluno
// injustamente. O que TEM resposta é como o texto entrou aqui: digitado tecla
// a tecla ou colado de uma vez. Isso é fato observado, não inferência.
//
// Importante: "colado" não significa "feito por IA". Quem escreveu no Word e
// colou cai aqui do mesmo jeito, e a tela precisa dizer isso.

/** Pausa a partir da qual o cronômetro para de contar (a pessoa saiu do teclado). */
const GAP_INATIVIDADE_MS = 60_000;

/** A partir de quanto do texto vindo de colagem cada rótulo se aplica. */
const LIMIAR_COLADO = 0.8;
const LIMIAR_MISTO = 0.2;

interface Contadores {
  digitados: number;
  colados: number;
  eventosColagem: number;
  tempoAtivoMs: number;
  ultimoEventoEm: number | null;
  /** Marca que a mudança em curso veio de uma colagem, não do teclado. */
  colagemEmCurso: number;
}

function zerado(): Contadores {
  return {
    digitados: 0,
    colados: 0,
    eventosColagem: 0,
    tempoAtivoMs: 0,
    ultimoEventoEm: null,
    colagemEmCurso: 0,
  };
}

export interface RastreioProveniencia {
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onDrop: (e: React.DragEvent<HTMLTextAreaElement>) => void;
  registrarMudanca: (tamanhoAnterior: number, tamanhoNovo: number) => void;
  capturar: () => Proveniencia;
  reiniciar: () => void;
  houveColagem: () => boolean;
}

export function classificarOrigem(digitados: number, colados: number): OrigemTexto {
  const total = digitados + colados;
  if (total === 0) return "digitado";
  const fracao = colados / total;
  if (fracao >= LIMIAR_COLADO) return "colado";
  if (fracao >= LIMIAR_MISTO) return "misto";
  return "digitado";
}

/**
 * Contadores ficam em `useRef` de propósito: atualizar estado a cada tecla
 * renderizaria o editor inteiro a cada caractere digitado.
 */
export function useRastreioProveniencia(): RastreioProveniencia {
  const ref = useRef<Contadores>(zerado());

  const marcarTempo = useCallback(() => {
    const agora = Date.now();
    const anterior = ref.current.ultimoEventoEm;
    if (anterior !== null) {
      const intervalo = agora - anterior;
      // Pausa longa é a pessoa pensando longe do teclado (ou a aba em segundo
      // plano): não entra no tempo de escrita.
      if (intervalo < GAP_INATIVIDADE_MS) ref.current.tempoAtivoMs += intervalo;
    }
    ref.current.ultimoEventoEm = agora;
  }, []);

  const registrarColagem = useCallback(
    (conteudo: string) => {
      if (!conteudo) return;
      ref.current.colados += conteudo.length;
      ref.current.eventosColagem += 1;
      // O onChange correspondente chega logo depois; sem esta marca, ele
      // contaria os mesmos caracteres de novo como digitados.
      ref.current.colagemEmCurso = conteudo.length;
      marcarTempo();
    },
    [marcarTempo]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      registrarColagem(e.clipboardData.getData("text"));
    },
    [registrarColagem]
  );

  // Arrastar texto para dentro do campo é colar por outro caminho.
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => {
      registrarColagem(e.dataTransfer.getData("text"));
    },
    [registrarColagem]
  );

  const registrarMudanca = useCallback(
    (tamanhoAnterior: number, tamanhoNovo: number) => {
      const delta = tamanhoNovo - tamanhoAnterior;

      if (ref.current.colagemEmCurso > 0) {
        // Já contabilizado no onPaste/onDrop.
        ref.current.colagemEmCurso = 0;
        return;
      }

      // Apagar não conta como digitar, mas conta como tempo de trabalho.
      if (delta > 0) ref.current.digitados += delta;
      marcarTempo();
    },
    [marcarTempo]
  );

  const capturar = useCallback((): Proveniencia => {
    const { digitados, colados, eventosColagem, tempoAtivoMs } = ref.current;
    return {
      caracteresDigitados: digitados,
      caracteresColados: colados,
      eventosColagem,
      tempoEdicaoSegundos: Math.round(tempoAtivoMs / 1000),
      origem: classificarOrigem(digitados, colados),
    };
  }, []);

  const reiniciar = useCallback(() => {
    ref.current = zerado();
  }, []);

  const houveColagem = useCallback(() => ref.current.eventosColagem > 0, []);

  return { onPaste, onDrop, registrarMudanca, capturar, reiniciar, houveColagem };
}

/** Estimativa de linhas na folha do ENEM (30 linhas de ~90 caracteres). */
const CHARS_POR_LINHA = 90;
const LINHAS_ENEM = 30;

export function EditorRedacao({
  valor,
  onChange,
  rastreio,
  desabilitado = false,
}: {
  valor: string;
  onChange: (texto: string) => void;
  rastreio: RastreioProveniencia;
  desabilitado?: boolean;
}) {
  const linhas = Math.ceil(valor.length / CHARS_POR_LINHA);
  const excedeu = linhas > LINHAS_ENEM;
  const curta = valor.length > 0 && linhas < 8;

  return (
    <div>
      <textarea
        value={valor}
        onPaste={rastreio.onPaste}
        onDrop={rastreio.onDrop}
        onChange={(e) => {
          rastreio.registrarMudanca(valor.length, e.target.value.length);
          onChange(e.target.value);
        }}
        disabled={desabilitado}
        rows={16}
        maxLength={6000}
        placeholder="Escreva ou cole sua redação aqui..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
      />

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-500">
          {valor.length} caracteres · ~{linhas} de {LINHAS_ENEM} linhas
        </span>

        {excedeu && (
          <span className="text-amber-600">
            Passou das 30 linhas da folha oficial — o excedente não seria corrigido.
          </span>
        )}
        {curta && !excedeu && (
          <span className="text-amber-600">
            Redação curta: até 7 linhas zera no ENEM.
          </span>
        )}
      </div>

      {rastreio.houveColagem() && (
        // Avisa antes de enviar, para ninguém ser pego de surpresa no resultado.
        <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          Parte deste texto foi colada. A correção registra isso — se você escreveu
          em outro editor e colou, está tudo certo, é só um dado a mais no relatório.
        </p>
      )}
    </div>
  );
}
