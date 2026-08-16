import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  buscarUidPorEmail,
  gravarAssinatura,
  gravarPendente,
  lerAssinatura,
} from "@/lib/data/assinaturaAdmin";
import { hojeISO, ontemISO, proximaExpiracao, somarUmMes } from "@/lib/data/assinaturaCore";
import type { KirvanoWebhook } from "@/lib/validators/studyflow";
import type { TierAssinatura } from "@/types/studyflow";

/**
 * Tradução dos eventos da Kirvano para o estado da assinatura.
 *
 * A documentação pública fecha só parte dos nomes técnicos (SALE_APPROVED,
 * SALE_REFUSED, SALE_CHARGEBACK, PIX_*, BANK_SLIP_*) e cita, sem nome técnico,
 * eventos de assinatura ativada/cancelada e reembolso. Por isso o casamento é
 * por padrão no nome do evento, e não por lista fechada: um nome novo cai no
 * caso "ignorar" (loga e responde 200) em vez de quebrar o endpoint.
 */
export type EfeitoEvento =
  | { acao: "ativar" }
  | { acao: "inadimplente" }
  | { acao: "cancelar"; imediato: boolean }
  | { acao: "ignorar"; motivo: string };

export function efeitoDoEvento(evento: string): EfeitoEvento {
  const e = evento.toUpperCase();

  // Ordem importa: CHARGEBACK e REFUND revogam na hora (o dinheiro voltou);
  // REFUSED só sinaliza inadimplência. Cuidado com REFUSED × REFUND — os dois
  // começam com "REFU".
  if (e.includes("CHARGEBACK")) return { acao: "cancelar", imediato: true };
  if (e.includes("REFUND") || e.includes("REEMBOLS")) {
    return { acao: "cancelar", imediato: true };
  }
  // Cancelamento de assinatura: já pagou o ciclo corrente, mantém até o fim.
  if (e.includes("CANCEL")) return { acao: "cancelar", imediato: false };
  if (e.includes("REFUSED") || e.includes("RECUSAD")) return { acao: "inadimplente" };
  // Compra aprovada, assinatura ativada e renovação caem todas aqui.
  if (
    e.includes("APPROVED") ||
    e.includes("PAID") ||
    e.includes("RENEW") ||
    e.includes("ACTIVATED")
  ) {
    return { acao: "ativar" };
  }
  // PIX/boleto apenas gerados ou expirados não mexem em acesso.
  return { acao: "ignorar", motivo: "evento sem efeito sobre o acesso" };
}

/**
 * Descobre se a compra foi Base ou Pro.
 *
 * Os nomes dos subcampos de `products[]`/`plan` não estão documentados, então
 * varremos todos os valores string do payload e comparamos com os
 * identificadores configurados. É tolerante a mudança de formato.
 *
 * Na dúvida devolve "base": conceder Base indevidamente é barato; conceder Pro
 * libera a API de IA e queima margem.
 */
export function detectarTier(payloadCru: unknown): {
  tier: TierAssinatura;
  reconhecido: boolean;
} {
  const idBase = (process.env.KIRVANO_OFERTA_BASE_ID ?? "").trim().toLowerCase();
  const idPro = (process.env.KIRVANO_OFERTA_PRO_ID ?? "").trim().toLowerCase();

  const valores = coletarStrings(payloadCru);

  if (idPro && valores.has(idPro)) return { tier: "pro", reconhecido: true };
  if (idBase && valores.has(idBase)) return { tier: "base", reconhecido: true };

  return { tier: "base", reconhecido: false };
}

function coletarStrings(valor: unknown, profundidade = 0, acc?: Set<string>): Set<string> {
  const encontrados = acc ?? new Set<string>();
  if (profundidade > 6) return encontrados;

  if (typeof valor === "string") {
    encontrados.add(valor.trim().toLowerCase());
  } else if (Array.isArray(valor)) {
    for (const item of valor) coletarStrings(item, profundidade + 1, encontrados);
  } else if (valor && typeof valor === "object") {
    for (const item of Object.values(valor)) {
      coletarStrings(item, profundidade + 1, encontrados);
    }
  }
  return encontrados;
}

export function extrairEmail(payload: KirvanoWebhook, payloadCru: unknown): string | null {
  const doSchema = payload.customer?.email;
  if (doSchema && doSchema.includes("@")) return doSchema;

  // Fallback: procura qualquer coisa com "@" no corpo cru.
  for (const valor of coletarStrings(payloadCru)) {
    if (valor.includes("@") && valor.includes(".")) return valor;
  }
  return null;
}

/**
 * Idempotência. A Kirvano não documenta um id único de evento, então a chave é
 * evento + venda. Reentrega do mesmo evento não pode liberar acesso duas vezes
 * nem estender a validade de novo.
 *
 * Retorna false quando o evento já tinha sido processado.
 */
export async function registrarEventoUmaVez(
  payload: KirvanoWebhook,
  payloadCru: unknown,
  email: string | null,
  tier: TierAssinatura
): Promise<boolean> {
  const idBruto = `${payload.event}_${payload.sale_id ?? payload.checkout_id ?? "sem-id"}`;
  const id = idBruto.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 400);

  try {
    await getAdminFirestore()
      .collection("pagamentos")
      .doc(id)
      .create({
        evento: payload.event,
        saleId: payload.sale_id ?? null,
        checkoutId: payload.checkout_id ?? null,
        email,
        tier,
        tipo: payload.type ?? null,
        statusKirvano: payload.status ?? null,
        metodoPagamento: payload.payment_method ?? null,
        valor: payload.total_price ?? null,
        gateway: "kirvano",
        payload: JSON.stringify(payloadCru).slice(0, 20000),
        criadoEm: FieldValue.serverTimestamp(),
      });
    return true;
  } catch {
    // create() falha se o documento já existe → evento repetido.
    return false;
  }
}

export interface ResultadoProcessamento {
  aplicado: boolean;
  detalhe: string;
}

export async function processarEvento(
  payload: KirvanoWebhook,
  payloadCru: unknown
): Promise<ResultadoProcessamento> {
  const efeito = efeitoDoEvento(payload.event);
  const email = extrairEmail(payload, payloadCru);
  const { tier, reconhecido } = detectarTier(payloadCru);

  if (!reconhecido && efeito.acao === "ativar") {
    console.warn(
      `[kirvano] oferta não reconhecida no evento ${payload.event} — liberando Base por segurança. ` +
        "Confira KIRVANO_OFERTA_BASE_ID / KIRVANO_OFERTA_PRO_ID."
    );
  }

  // Grava o evento no ledger antes de agir. Se já existia, é reentrega.
  const inedito = await registrarEventoUmaVez(payload, payloadCru, email, tier);
  if (!inedito) {
    return { aplicado: false, detalhe: "evento já processado (reentrega)" };
  }

  if (efeito.acao === "ignorar") {
    return { aplicado: false, detalhe: efeito.motivo };
  }

  if (!email) {
    console.error(`[kirvano] evento ${payload.event} sem e-mail identificável.`);
    return { aplicado: false, detalhe: "e-mail não encontrado no payload" };
  }

  const plano = tier === "pro" ? "Study Flow Pro" : "Study Flow Base";

  if (efeito.acao === "ativar") {
    const uid = await buscarUidPorEmail(email);
    if (!uid) {
      // Ainda não criou conta: guarda o acesso para o cadastro liberar.
      await gravarPendente(email, {
        status: "ativo",
        tier,
        plano,
        expiracao: somarUmMes(hojeISO()),
      });
      return { aplicado: true, detalhe: "acesso guardado como pendente (conta ainda não existe)" };
    }

    // Renovação soma em cima do que resta, sem perder dias pagos.
    const atual = await lerAssinatura(uid);
    await gravarAssinatura(uid, {
      status: "ativo",
      tier,
      plano,
      expiracao: proximaExpiracao(atual?.expiracao),
    });
    return { aplicado: true, detalhe: `assinatura ativada (${tier})` };
  }

  if (efeito.acao === "inadimplente") {
    const uid = await buscarUidPorEmail(email);
    if (!uid) return { aplicado: false, detalhe: "sem conta para marcar inadimplência" };
    const atual = await lerAssinatura(uid);
    // Mantém a expiração: é carência, não corte imediato.
    await gravarAssinatura(uid, {
      status: "inadimplente",
      tier: atual?.tier,
      plano: atual?.plano,
      expiracao: atual?.expiracao,
    });
    return { aplicado: true, detalhe: "marcado como inadimplente (mantém carência)" };
  }

  // cancelar
  const uid = await buscarUidPorEmail(email);
  if (!uid) {
    // Cancelou antes de criar conta: a pendência não deve virar acesso.
    await getAdminFirestore()
      .collection("assinaturasPendentes")
      .doc(email.trim().toLowerCase())
      .delete()
      .catch(() => {});
    return { aplicado: true, detalhe: "pendência removida (cancelamento antes do cadastro)" };
  }

  const atual = await lerAssinatura(uid);
  await gravarAssinatura(uid, {
    status: "cancelado",
    tier: atual?.tier,
    plano: atual?.plano,
    // Chargeback/reembolso cortam na hora (por isso ontem, e não hoje:
    // gravar hoje ainda liberaria o resto do dia); cancelamento simples
    // respeita o ciclo já pago.
    expiracao: efeito.imediato ? ontemISO() : atual?.expiracao,
  });
  return {
    aplicado: true,
    detalhe: efeito.imediato ? "acesso revogado imediatamente" : "cancelado ao fim do ciclo",
  };
}

/**
 * Confere o Token configurado na Kirvano.
 *
 * O header exato não está documentado, então aceitamos os candidatos mais
 * prováveis e a query string. Depois do primeiro evento real, dá para apertar
 * isto para o header único que a Kirvano de fato manda.
 */
export function tokenValido(request: Request): boolean {
  const esperado = (
    process.env.KIRVANO_WEBHOOK_TOKEN ??
    process.env.KIRVANO_WEBHOOK_SECRET ??
    ""
  ).trim();

  if (!esperado) {
    console.warn(
      "[kirvano] KIRVANO_WEBHOOK_TOKEN não configurado — endpoint aceitando qualquer origem."
    );
    return true;
  }

  const candidatos = [
    request.headers.get("x-kirvano-token"),
    request.headers.get("x-kirvano-secret"),
    request.headers.get("security-token"),
    request.headers.get("token"),
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""),
    new URL(request.url).searchParams.get("token"),
    new URL(request.url).searchParams.get("secret"),
  ];

  return candidatos.some((valor) => valor?.trim() === esperado);
}
