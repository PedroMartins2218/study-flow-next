import Image from "next/image";
import mark from "../../../public/logo-mark.png";

type LogoProps = {
  /** Mostra o texto "Study Flow" ao lado do monograma. */
  withWordmark?: boolean;
  /** Esquema de cor do texto: azul da marca (padrão) ou claro para fundos escuros. */
  tone?: "brand" | "light";
  className?: string;
};

/**
 * Marca do Study Flow: monograma oficial (public/logo-mark.png) + wordmark
 * opcional. Em fundos escuros o monograma vai dentro de um chip branco para
 * garantir contraste. A logo completa (monograma + "Study Flow") está em
 * public/logo.png para usos maiores.
 */
export function Logo({ withWordmark = true, tone = "brand", className }: LogoProps) {
  const isLight = tone === "light";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      {isLight ? (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white">
          <Image src={mark} alt="Study Flow" priority className="h-6 w-auto" />
        </span>
      ) : (
        <Image src={mark} alt="Study Flow" priority className="h-8 w-auto" />
      )}
      {withWordmark && (
        <span
          className={`text-lg font-bold tracking-tight ${
            isLight ? "text-white" : "text-slate-900"
          }`}
        >
          Study Flow
        </span>
      )}
    </span>
  );
}
