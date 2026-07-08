"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  erroInicializacao: string | null;
  login: (email: string, senha: string) => Promise<void>;
  registrar: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [erroInicializacao, setErroInicializacao] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return unsubscribe;
    } catch (err) {
      console.error("Falha ao inicializar Firebase Auth:", err);
      queueMicrotask(() => {
        setErroInicializacao(
          "Firebase não configurado. Verifique as variáveis NEXT_PUBLIC_FIREBASE_* em .env.local."
        );
        setLoading(false);
      });
    }
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    erroInicializacao,
    login: async (email, senha) => {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, senha);
    },
    registrar: async (email, senha) => {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, senha);
    },
    logout: async () => {
      await signOut(getFirebaseAuth());
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
