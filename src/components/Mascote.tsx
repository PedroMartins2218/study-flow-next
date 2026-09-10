import Image from "next/image";
import mascote from "../../public/mascote.png";

/**
 * Mascote do Nexo Study — o "assistente" que acompanha o usuário em todas as
 * telas do painel (montado no DashboardShell, canto superior direito).
 *
 * Por enquanto é puramente decorativo: não fala, não recebe clique e fica fora
 * da árvore de acessibilidade (alt vazio + aria-hidden), para não virar ruído
 * em leitor de tela. A flutuação vem da classe `mascote-flutuando`, definida no
 * globals.css dentro do bloco de prefers-reduced-motion — quem pede menos
 * movimento vê o mascote parado.
 *
 * O PNG em public/ foi recortado do JPEG original (fundo preto removido), então
 * o mascote assenta tanto no header escuro do celular quanto no fundo claro do
 * painel.
 */
export function Mascote({ className }: { className?: string }) {
  return (
    <Image
      src={mascote}
      alt=""
      aria-hidden
      className={`mascote-flutuando w-auto select-none ${className ?? ""}`}
    />
  );
}
