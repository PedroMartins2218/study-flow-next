// Blocos de carregamento (skeleton) — usam animate-pulse do Tailwind; o
// bg-slate-200 é trocado no tema escuro pelas regras de globals.css.

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

// Lista de cards em carregamento, no formato das telas internas.
export function CardsSkeleton({ linhas = 4 }: { linhas?: number }) {
  return (
    <ul className="space-y-2" aria-hidden="true">
      {Array.from({ length: linhas }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
        >
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
