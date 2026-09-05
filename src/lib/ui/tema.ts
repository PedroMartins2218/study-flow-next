// Onde o tema escuro vale — e onde não vale.
//
// O tema escuro é do APLICATIVO. A landing, as páginas legais e o checkout de
// entrada são material público: precisam ter sempre a mesma cara, igual à
// imagem que aparece quando alguém compartilha o link.
//
// Isso não era só estética. O `globals.css` sobrescreve classes do Tailwind
// pelo nome exato quando `.dark` está no <html> — `bg-white` vira escuro,
// `text-slate-900` vira claro, e assim por diante. A landing foi desenhada só
// para o tema claro e usa essas mesmas classes, então, com o `.dark` ligado,
// ela saía com fundos cinzas e textos ilegíveis: metade das cores invertidas,
// metade não.

/** Rotas públicas: sempre no tema claro, independente da preferência salva. */
const PREFIXOS_PUBLICOS = ["/login", "/privacidade", "/termos", "/obrigado", "/admin"];

/**
 * Esta rota usa o tema escolhido pelo usuário?
 * Só o app protegido usa — o resto é material público.
 */
export function rotaUsaTemaDoUsuario(caminho: string): boolean {
  const p = caminho.replace(/\/+$/, "") || "/";
  if (p === "/") return false;
  return !PREFIXOS_PUBLICOS.some((pub) => p === pub || p.startsWith(pub + "/"));
}

/** Liga ou desliga o `.dark` no <html> conforme a rota e a preferência salva. */
export function aplicarTemaDaRota(caminho: string): void {
  let escuro = false;
  try {
    escuro = localStorage.getItem("sf_tema") === "escuro";
  } catch {
    // Armazenamento bloqueado (janela anônima, por exemplo): fica no claro.
  }
  document.documentElement.classList.toggle(
    "dark",
    escuro && rotaUsaTemaDoUsuario(caminho)
  );
}
