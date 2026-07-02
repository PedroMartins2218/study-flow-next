"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/materias", label: "Matérias" },
  { href: "/atividades", label: "Atividades" },
  { href: "/trabalhos", label: "Trabalhos" },
  { href: "/provas", label: "Provas" },
  { href: "/foco", label: "Foco" },
] as const;

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
      <aside className="hidden w-56 flex-col border-r border-slate-200 bg-white p-4 sm:flex">
        <div className="mb-6 px-2 text-lg font-semibold text-slate-900">
          Study Flow
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  ativo
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 pt-3 text-xs text-slate-500">
          <p className="truncate">{user?.email}</p>
          <Link
            href="/assinatura"
            className="mt-2 block rounded-lg px-2 py-1.5 text-center text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            Minha assinatura
          </Link>
          <button
            onClick={handleLogout}
            className="mt-1 w-full rounded-lg border border-slate-300 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
          <span className="text-lg font-semibold text-slate-900">Study Flow</span>
          <div className="flex items-center gap-3">
            <Link href="/assinatura" className="text-xs font-medium text-slate-500">
              Assinatura
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-slate-600"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>

        <nav className="flex justify-around border-t border-slate-200 bg-white py-2 sm:hidden">
          {NAV_ITEMS.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-medium ${
                  ativo ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
