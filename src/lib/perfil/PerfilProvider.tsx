"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { subscribeToPerfil, type Perfil } from "@/lib/data/perfil";

const PerfilCtx = createContext<Perfil>({});

export function usePerfil() {
  return useContext(PerfilCtx);
}

export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<Perfil>({});

  useEffect(() => {
    if (!user) return;
    return subscribeToPerfil(user.uid, setPerfil);
  }, [user]);

  return <PerfilCtx.Provider value={perfil}>{children}</PerfilCtx.Provider>;
}
