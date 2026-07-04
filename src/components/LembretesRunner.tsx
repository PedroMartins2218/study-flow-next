"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  jaRodouHoje,
  lerPrefs,
  marcarRodadoHoje,
  montarLembretes,
} from "@/lib/data/lembretes";

// Dispara os lembretes do navegador uma vez por dia (por dispositivo), quando
// o usuário abre o painel — se ele tiver ativado e concedido permissão.
// Observação: notificações locais só disparam com o app aberto; push com o app
// fechado exigiria FCM + agendamento no servidor (fora do escopo atual).
export function LembretesRunner() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const prefs = lerPrefs();
    if (!prefs.ativo || jaRodouHoje()) return;

    let cancelado = false;
    montarLembretes(user.uid, prefs)
      .then((msgs) => {
        if (cancelado) return;
        marcarRodadoHoje();
        msgs.slice(0, 3).forEach((m, i) =>
          setTimeout(() => {
            try {
              new Notification("Study Flow", { body: m });
            } catch {
              // ignora se o navegador bloquear
            }
          }, i * 500)
        );
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [user]);

  return null;
}
