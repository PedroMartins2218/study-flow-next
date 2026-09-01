import "server-only";

import { timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  buscarUidPorEmail,
  gravarAssinatura,
  gravarPendente,
  lerAssinatura,
} from "@/lib/data/assinaturaAdmin";
import { hojeISO, ontemISO, proximaExpiracao, somarUmMes } from "@/lib/data/assinaturaCore";
import type { CaktoWebhook } from "@/lib/validators/dominio";
import type { TierAssinatura } from "@/types/dominio";

/**
 * Tradução dos eventos da Cakto para o estado da assinatura.
 *
 * Ao contrário do gateway anterior, a Cakto documenta a lista fechada de
 * eventos, então o mapa é explícito — nada de casar por pedaço de string.
 * Evento desconhecido cai em "ignorar": loga e responde 2xx, porque erro faz a
 * Cakto reenviar até 5 vezes (5s, 1min, 2,5min, 6min, 30min).
 */
export type EfeitoEvento =
  | { acao: "ativar" }
  | { acao: "inadimplente" }
  | { acao: "cancelar"; imediato: boolean }
  | { acao: "ignorar"; motivo: string };

const EFEITOS: Record<string, EfeitoEvento> = {
  // Dinheiro entrou: libera ou renova.
  purchase_approved: { acao: "ativar" },
  subscription_created: { acao: "ativar" },
  subscription_renewed: { acao: "ativar" },
  subscription_resumed: { acao: "ativar" },

  // Cobrança falhou: carência, sem cortar o que já foi pago.
  purchase_refused: { acao: "inadimplente" },
  subscription_renewal_refused: { acao: "inadimplente" },

  // Dinheiro voltou: corta na hora.
  refund: { acao: "cancelar", imediato: true },
  chargeback: { acao: "cancelar", imediato: true },

  // Não renova mais, mas o ciclo pago é respeitado até o fim.
  subscription_canceled: { acao: "cancelar", imediato: false },
  subscription_paused: { acao: "cancelar", imediato: false },

  // Intenção de compra e cobrança apenas gerada não mexem em acesso.
  initiate_checkout: { acao: "ignorar", motivo: "apenas início de checkout" },
  checkout_abandonment: { acao: "ignorar", motivo: "checkout abandonado" },
  pix_gerado: { acao: "ignorar", motivo: "cobrança gerada, ainda não paga" },
  boleto_gerado: { acao: "ignorar", motivo: "cobrança gerada, ainda não paga" },
  picpay_gerado: { acao: "ignorar", motivo: "cobrança gerada, ainda não paga" },
  openfinance_nubank_gerado: { acao: "ignorar", motivo: "cobrança gerada, ainda não paga" },
};

export function efeitoDoEvento(evento: string): EfeitoEvento {
  const conhecido = EFEITOS[evento.trim().toLowerCase()];
  if (conhecido) return conhecido;
  return { acao: "ignorar", motivo: `evento desconhecido: ${evento}` };
}

/**
 * Descobre se a compra foi Base ou Pro pelo id da oferta.
 *
 * Na dúvida devolve "base": conceder Base indevidamente é barato; conceder Pro
 * libera a API de IA e queima margem.
 */
export function detectarTier(payload: CaktoWebhook): {
  tier: TierAssinatura;
  vitalicio: boolean;
  reconhecido: boolean;
} {
  const idBase = (process.env.CAKTO_OFERTA_BASE_ID ?? "").trim().toLowerCase();
  const idPro = (process.env.CAKTO_OFERTA_PRO_ID ?? "").trim().toLowerCase();
  const idVitalicio = (process.env.CAKTO_OFERTA_VITALICIO_ID ?? "").trim().toLowerCase();
  const oferta = payload.data?.offer?.id?.trim().toLowerCase() ?? "";

  // Vitalício vem primeiro: é compra única e dá acesso Pro para sempre.
  if (idVitalicio && oferta === idVitalicio) {
    return { tier: "pro", vitalicio: true, reconhecido: true };
  }
  if (idPro && oferta === idPro) return { tier: "pro", vitalicio: false, reconhecido: true };
  if (idBase && oferta === idBase) return { tier: "base", vitalicio: false, reconhecido: true };

  return { tier: "base", vitalicio: false, reconhecido: false };
}

export function extrairEmail(payload: CaktoWebhook): string | null {
  const email = payload.data?.customer?.email?.trim().toLowerCase();
  return email && email.includes("@") ? email : null;
}

/**
 * Idempotência. A Cakto recomenda `data.id` como chave de deduplicação, e a
 * reentrega automática (até 5 tentativas) torna isto obrigatório: o mesmo
 * evento não pode liberar acesso duas vezes nem estender a validade de novo.
 *
 * Retorna false quando o evento já tinha sido processado.
 */
export async function registrarEventoUmaVez(
  payload: CaktoWebhook,
  payloadCru: unknown,
  email: string | null,
  tier: TierAssinatura
): Promise<boolean> {
  const idBruto = `${payload.event}_${payload.data?.id ?? payload.data?.refId ?? "sem-id"}`;
  const id = idBruto.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 400);

  try {
    await getAdminFirestore()
      .collection("pagamentos")
      .doc(id)
      .create({
        evento: payload.event,
        saleId: payload.data?.id ?? null,
        refId: payload.data?.refId ?? null,
        email,
        tier,
        ofertaId: payload.data?.offer?.id ?? null,
        statusCakto: payload.data?.status ?? null,
        metodoPagamento: payload.data?.paymentMethod ?? null,
        valor: payload.data?.amount ?? null,
        gateway: "cakto",
        payload: JSON.stringify(payloadCru).slice(0, 20000),
        criadoEm: FieldValue.serverTimestamp(),
      });
    return true;
  } catch {
    // create() falha quando o documento já existe, ou seja, evento repetido.
    return false;
  }
}

export interface ResultadoProcessamento {
  aplicado: boolean;
  detalhe: string;
}

export async function processarEvento(
  payload: CaktoWebhook,
  payloadCru: unknown
): Promise<ResultadoProcessamento> {
  const efeito = efeitoDoEvento(payload.event);
  const email = extrairEmail(payload);
  const { tier, vitalicio, reconhecido } = detectarTier(payload);

  if (!reconhecido && efeito.acao === "ativar") {
    console.warn(
      `[cakto] oferta ${payload.data?.offer?.id ?? "?"} não reconhecida no evento ` +
        `${payload.event} — liberando Base por segurança. ` +
        "Confira CAKTO_OFERTA_BASE_ID / CAKTO_OFERTA_PRO_ID."
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
    console.error(`[cakto] evento ${payload.event} sem e-mail identificável.`);
    return { aplicado: false, detalhe: "e-mail não encontrado no payload" };
  }

  const plano = vitalicio
    ? "Nexo Study Vitalício"
    : tier === "pro"
      ? "Nexo Study Pro"
      : "Nexo Study Base";

  if (efeito.acao === "ativar") {
    const uid = await buscarUidPorEmail(email);
    if (!uid) {
      // Ainda não criou conta: guarda o acesso para o cadastro liberar.
      await gravarPendente(email, {
        status: "ativo",
        tier,
        plano,
        vitalicio,
        // Vitalício não tem data de renovação; os demais valem um mês.
        expiracao: vitalicio ? undefined : somarUmMes(hojeISO()),
      });
      return { aplicado: true, detalhe: "acesso guardado como pendente (conta ainda não existe)" };
    }

    // Renovação soma em cima do que resta, sem perder dias pagos.
    const atual = await lerAssinatura(uid);
    await gravarAssinatura(uid, {
      status: "ativo",
      tier,
      plano,
      vitalicio: vitalicio || atual?.vitalicio,
      expiracao: vitalicio ? undefined : proximaExpiracao(atual?.expiracao),
    });
    return {
      aplicado: true,
      detalhe: vitalicio ? "acesso vitalício liberado" : `assinatura ativada (${tier})`,
    };
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
      .doc(email)
      .delete()
      .catch(() => {});
    return { aplicado: true, detalhe: "pendência removida (cancelamento antes do cadastro)" };
  }

  const atual = await lerAssinatura(uid);
  await gravarAssinatura(uid, {
    status: "cancelado",
    tier: atual?.tier,
    plano: atual?.plano,
    // Reembolso e chargeback derrubam o vitalício: como ele ignora a data,
    // mexer só na expiração não revogaria nada. Cancelamento simples de uma
    // compra vitalícia não existe (não há assinatura para cancelar), então
    // preservamos o valor atual nesse caso.
    vitalicio: efeito.imediato ? false : atual?.vitalicio,
    // Chargeback e reembolso cortam na hora (por isso ontem, e não hoje:
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
 * Confere o `secret` que a Cakto manda NO CORPO do evento.
 *
 * A Cakto não assina o payload com HMAC nem envia header de assinatura, então
 * este campo é a única prova de origem — trate-o como senha.
 *
 * Falha FECHADO: sem a variável configurada, recusa tudo. O gateway anterior
 * fazia o contrário, e um deploy sem a variável teria deixado o endpoint aberto
 * para qualquer um forjar uma venda aprovada.
 */
export function segredoValido(payload: CaktoWebhook): boolean {
  const esperado = (process.env.CAKTO_WEBHOOK_SECRET ?? "").trim();

  if (!esperado) {
    console.error(
      "[cakto] CAKTO_WEBHOOK_SECRET não configurado — recusando o evento. " +
        "Configure a variável para o webhook voltar a funcionar."
    );
    return false;
  }

  const recebido = (payload.secret ?? "").trim();
  if (!recebido) return false;

  // Comparação de tempo constante: com igualdade simples, o tempo de resposta
  // vaza quantos caracteres iniciais estão corretos.
  const a = Buffer.from(recebido, "utf8");
  const b = Buffer.from(esperado, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
