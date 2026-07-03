import { Icone } from "./Icone";

// Ilustração leve e neutra para os estados vazios (documento + "+").
// Usa tons médios (slate-400/300) + azul da marca, que funcionam bem tanto no
// tema claro quanto no escuro sem precisar de variantes.
function Ilustracao() {
  return (
    <svg width="96" height="78" viewBox="0 0 96 78" fill="none" aria-hidden="true" className="mb-1">
      <rect x="20" y="14" width="56" height="48" rx="7" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <line x1="31" y1="30" x2="65" y2="30" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1="31" y1="40" x2="56" y2="40" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="68" cy="56" r="15" fill="#2563eb" />
      <path d="M68 50v12M62 56h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Estado vazio encorajador: ilustração + título + descrição + ação opcional.
export function EmptyState({
  icone,
  titulo,
  descricao,
  acao,
  ilustrado = true,
}: {
  icone?: string;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
  ilustrado?: boolean;
}) {
  return (
    <div className="animate-in flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
      {ilustrado ? (
        <Ilustracao />
      ) : (
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icone nome={icone ?? "livro"} className="h-6 w-6" />
        </span>
      )}
      <p className="font-medium text-slate-900">{titulo}</p>
      {descricao && <p className="mt-1 max-w-xs text-sm text-slate-500">{descricao}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
