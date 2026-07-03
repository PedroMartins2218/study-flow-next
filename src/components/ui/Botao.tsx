import { Icone } from "./Icone";

type Variante = "primario" | "secundario";

// Botão padrão do painel. Variante primária = azul da marca; secundária =
// contorno neutro. Aceita um ícone opcional à esquerda.
export function Botao({
  children,
  variante = "primario",
  icone,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  icone?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60";
  const estilos =
    variante === "primario"
      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
      : "border border-slate-300 text-slate-700 hover:bg-slate-50";
  return (
    <button className={`${base} ${estilos} ${className}`} {...props}>
      {icone && <Icone nome={icone} className="h-4 w-4" />}
      {children}
    </button>
  );
}
