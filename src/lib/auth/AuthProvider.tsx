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
  sendEmailVerification,
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

/**
 * Puxa para a conta uma compra que a Cakto já aprovou antes de o usuário se
 * cadastrar (fluxo "pagar primeiro, criar conta depois"). Falha em silêncio de
 * propósito: não pode impedir o login, e a tela /assinatura tem o botão
 * "Já paguei" como plano B.
 */
async function sincronizarAssinatura(usuario: User) {
  try {
    // `true` força um token novo: logo após confirmar o e-mail, o token em
    // cache ainda diz email_verified=false e o servidor recusaria de novo.
    const token = await usuario.getIdToken(true);
    const resp = await fetch("/api/assinatura/sincronizar", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    // Há compra esperando, mas o e-mail ainda não foi confirmado: manda o
    // link automaticamente, para a pessoa não ficar travada sem entender.
    if (resp.status === 403) {
      const dados = await resp.json().catch(() => ({}));
      if (dados?.precisaVerificarEmail) {
        await enviarVerificacaoEmail(usuario);
      }
    }
  } catch (erro) {
    console.error("Falha ao sincronizar assinatura:", erro);
  }
}

/**
 * Envia (ou reenvia) o e-mail de confirmação. O Firebase limita a frequência
 * por conta própria, então chamar demais devolve erro em vez de spammar.
 */
export async function enviarVerificacaoEmail(usuario: User): Promise<void> {
  try {
    await sendEmailVerification(usuario);
  } catch (erro) {
    console.error("Falha ao enviar e-mail de verificação:", erro);
  }
}

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
      const credencial = await signInWithEmailAndPassword(getFirebaseAuth(), email, senha);
      await sincronizarAssinatura(credencial.user);
    },
    registrar: async (email, senha) => {
      const credencial = await createUserWithEmailAndPassword(getFirebaseAuth(), email, senha);
      await sincronizarAssinatura(credencial.user);
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
