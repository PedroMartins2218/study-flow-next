type Tom = "neutro" | "sucesso" | "alerta" | "perigo" | "info";

const TONS: Record<Tom, string> = {
  neutro: "bg-slate-100 text-slate-600",
  sucesso: "bg-emerald-500/10 text-emerald-600",
  alerta: "bg-amber-500/10 text-amber-600",
  perigo: "bg-red-500/10 text-red-600",
  info: "bg-blue-500/10 text-blue-600",
};

export function Badge({
  children,
  tom = "neutro",
}: {
  children: React.ReactNode;
  tom?: Tom;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONS[tom]}`}
    >
      {children}
    </span>
  );
}
