"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { aplicarTemaDaRota } from "@/lib/ui/tema";

/**
 * Mantém o `.dark` do <html> coerente com a rota atual.
 *
 * O script embutido no layout resolve o primeiro carregamento (sem piscar),
 * mas o Next navega sem recarregar a página: sem isto, quem entrasse pela
 * landing e fosse para o app ficaria presa no tema claro, e quem voltasse do
 * app para a landing a veria com as cores quebradas.
 */
export function TemaPorRota() {
  const caminho = usePathname();

  useEffect(() => {
    aplicarTemaDaRota(caminho);
  }, [caminho]);

  return null;
}
