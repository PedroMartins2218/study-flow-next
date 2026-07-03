"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { assinaturaEstaAtiva, subscribeToAssinatura } from "@/lib/data/assinatura";
import type { Assinatura } from "@/types/studyflow";

const ROTA_ASSINATURA = "/assinatura";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [assinatura, setAssinatura] = useState<Assinatura | null | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    return subscribeToAssinatura(user.uid, setAssinatura);
  }, [user]);

  useEffect(() => {
    if (!user || assinatura === undefined) return;
    if (pathname !== ROTA_ASSINATURA && !assinaturaEstaAtiva(assinatura)) {
      router.replace(ROTA_ASSINATURA);
    }
  }, [user, assinatura, pathname, router]);

  const aguardandoAssinatura =
    pathname !== ROTA_ASSINATURA && assinatura !== undefined && !assinaturaEstaAtiva(assinatura);

  if (loading || !user || assinatura === undefined || aguardandoAssinatura) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <ConfirmProvider>
        <DashboardShell>{children}</DashboardShell>
      </ConfirmProvider>
    </ToastProvider>
  );
}
