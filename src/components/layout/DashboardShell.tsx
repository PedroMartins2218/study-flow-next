"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { usePerfil } from "@/lib/perfil/PerfilProvider";
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

// No celular, a barra fixa mostra os 4 destinos mais usados + "Mais".
const NAV_MOBILE = ["/dashboard", "/materias", "/atividades", "/foco"];
// O resto vai para o menu "Mais".
const NAV_MAIS = NAV_ITEMS.filter((i) => !NAV_MOBILE.includes(i.href));

function iniciais(nome: string | null | undefined, email: string | null | undefined) {
  const base = (nome ?? email ?? "?").trim();
  const partes = base.split(/[\s@.]+/).filter(Boolean);
  return (partes[0]?.[0] ?? "?").toUpperCase() + (partes[1]?.[0]?.toUpperCase() ?? "");
}

function Avatar({
  tamanho,
  foto,
  fallback,
}: {
  tamanho: string;
  foto?: string;
  fallback: string;
}) {
  return foto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={foto} alt="" className={`${tamanho} shrink-0 rounded-full object-cover`} />
  ) : (
    <span
      className={`${tamanho} flex shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white`}
    >
      {fallback}
    </span>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { foto } = usePerfil();
  const [maisAberto, setMaisAberto] = useState(false);
  const fallbackAvatar = iniciais(user?.displayName, user?.email);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-1">
      {/* Sidebar (desktop) */}
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
            <Avatar tamanho="h-8 w-8" foto={foto} fallback={fallbackAvatar} />
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

      {/* min-w-0 impede que o conteúdo/nav definam uma largura mínima maior
          que a tela (era a causa do corte lateral no celular). */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header (mobile) */}
        <header className="flex items-center justify-between bg-slate-950 px-4 py-3 sm:hidden">
          <Logo tone="light" />
          <Link href="/configuracoes" aria-label="Configurações">
            <Avatar tamanho="h-8 w-8" foto={foto} fallback={fallbackAvatar} />
          </Link>
        </header>

        {/* pb extra no mobile para o conteúdo não ficar atrás da nav fixa */}
        <main className="flex-1 p-4 pb-24 sm:p-8">{children}</main>

        {/* Nav inferior fixa (mobile) — 4 destinos + Mais, sem scroll lateral */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
          aria-label="Navegação"
        >
          {NAV_ITEMS.filter((i) => NAV_MOBILE.includes(i.href)).map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                  ativo ? "text-blue-600" : "text-slate-400"
                }`}
              >
                <Icone nome={item.icone} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => setMaisAberto(true)}
            className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              maisAberto || NAV_MAIS.some((i) => i.href === pathname) || pathname === "/configuracoes"
                ? "text-blue-600"
                : "text-slate-400"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            Mais
          </button>
        </nav>

        {/* Menu "Mais" (bottom sheet, mobile) */}
        <div
          className={`fixed inset-0 z-50 sm:hidden ${maisAberto ? "" : "pointer-events-none"}`}
          aria-hidden={!maisAberto}
        >
          <div
            onClick={() => setMaisAberto(false)}
            className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${
              maisAberto ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mais opções"
            className={`absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-200 ease-out ${
              maisAberto ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
            <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3">
              <Avatar tamanho="h-10 w-10" foto={foto} fallback={fallbackAvatar} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {user?.displayName ?? "Minha conta"}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_MAIS.map((item) => {
                const ativo = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMaisAberto(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium ${
                      ativo ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Icone nome={item.icone} className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/configuracoes"
                onClick={() => setMaisAberto(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium ${
                  pathname === "/configuracoes" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-700"
                }`}
              >
                <Icone nome="config" className="h-5 w-5" />
                Configurações
              </Link>
              <Link
                href="/assinatura"
                onClick={() => setMaisAberto(false)}
                className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"
              >
                <Icone nome="cartao" className="h-5 w-5" />
                Assinatura
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-red-600"
            >
              <Icone nome="sair" className="h-5 w-5" />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
