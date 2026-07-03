import Image from "next/image";
import mark from "../../../public/logo-mark.png";

type LogoProps = {
  /** Mostra o texto "Study Flow" ao lado do traço "ST". */
  withWordmark?: boolean;
  /** Esquema de cor do texto: azul da marca (padrão) ou claro para fundos escuros. */
  tone?: "brand" | "light";
  className?: string;
};

/**
 * Marca do Study Flow: traço "ST" (logo oficial em public/logo-mark.png) +
 * wordmark opcional. A logo completa (traço + "Study Flow") está em
 * public/logo.png para usos maiores.
 */
export function Logo({ withWordmark = true, tone = "brand", className }: LogoProps) {
  const isLight = tone === "light";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      {isLight ? (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          ST
        </span>
      ) : (
        <Image src={mark} alt="" priority className="h-8 w-auto" />
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
