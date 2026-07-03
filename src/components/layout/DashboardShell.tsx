"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Logo } from "@/components/marketing/Logo";
import { Icone } from "@/components/ui/Icone";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icone: "dashboard" },
  { href: "/materias", label: "Matérias", icone: "livro" },
  { href: "/atividades", label: "Atividades", icone: "check" },
  { href: "/trabalhos", label: "Trabalhos", icone: "arquivo" },
  { href: "/provas", label: "Provas", icone: "calendario" },
  { href: "/caderno", label: "Caderno", icone: "caderno" },
  { href: "/graficos", label: "Gráficos", icone: "grafico" },
  { href: "/foco", label: "Foco", icone: "alvo" },
] as const;

function iniciais(nome: string | null | undefined, email: string | null | undefined) {
  const base = (nome ?? email ?? "?").trim();
  const partes = base.split(/[\s@.]+/).filter(Boolean);
  return (partes[0]?.[0] ?? "?").toUpperCase() + (partes[1]?.[0]?.toUpperCase() ?? "");
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-60 flex-col bg-slate-950 p-4 sm:flex">
        <div className="mb-6 px-2 pt-1">
          <Logo tone="light" />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  ativo
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                }`}
              >
                <Icone nome={item.icone} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-3 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2.5 px-1 py-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {iniciais(user?.displayName, user?.email)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-200">
                {user?.displayName ?? "Minha conta"}
              </p>
              <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <Link
              href="/configuracoes"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                pathname === "/configuracoes"
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
              }`}
            >
              <Icone nome="config" className="h-4 w-4" />
              Configurações
            </Link>
            <Link
              href="/assinatura"
              className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800/70 hover:text-slate-100"
            >
              <Icone nome="cartao" className="h-4 w-4" />
              Minha assinatura
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800/70 hover:text-slate-100"
            >
              <Icone nome="sair" className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between bg-slate-950 px-4 py-3 sm:hidden">
          <Logo tone="light" />
          <button
            onClick={handleLogout}
            aria-label="Sair"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800"
          >
            <Icone nome="sair" className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-200 bg-white px-2 py-1.5 sm:hidden">
          {NAV_ITEMS.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium ${
                  ativo ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <Icone nome={item.icone} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
