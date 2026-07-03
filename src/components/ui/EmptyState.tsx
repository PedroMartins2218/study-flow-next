import { Icone } from "./Icone";

// Estado vazio encorajador: ícone + título + descrição + ação opcional.
export function EmptyState({
  icone = "livro",
  titulo,
  descricao,
  acao,
}: {
  icone?: string;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icone nome={icone} className="h-6 w-6" />
      </span>
      <p className="font-medium text-slate-900">{titulo}</p>
      {descricao && <p className="mt-1 max-w-xs text-sm text-slate-500">{descricao}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
