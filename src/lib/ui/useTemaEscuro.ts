"use client";

import { useEffect, useState } from "react";

/**
 * Diz se o tema escuro está ativo.
 *
 * O tema é aplicado pela classe `.dark` no <html> (ver globals.css), o que
 * resolve o app inteiro via CSS. Mas gráficos do Recharts recebem cores como
 * string em prop — não dá para estilizar por CSS — então aqui observamos a
 * classe para trocar as cores de eixo e grade junto com o resto.
 */
export function useTemaEscuro(): boolean {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    const raiz = document.documentElement;
    const atualizar = () => setEscuro(raiz.classList.contains("dark"));
    atualizar();

    const observer = new MutationObserver(atualizar);
    observer.observe(raiz, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return escuro;
}
