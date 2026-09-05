import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { TemaPorRota } from "@/components/TemaPorRota";
import "./globals.css";

// A tipografia do app é a pilha do sistema (Arial), definida no globals.css.
// Não carregamos fonte externa de propósito: economiza duas requisições ao
// Google Fonts em cada visita.

export const metadata: Metadata = {
  metadataBase: new URL("https://nexo-study-app-449.netlify.app"),
  title: "Nexo Study — organize seus estudos",
  description: "Organize seus estudos, acompanhe sua evolução e transforme foco em resultado.",
  openGraph: {
    title: "Nexo Study — organize seus estudos",
    description:
      "Matérias, atividades, provas, caderno e modo foco num só painel. Planos a partir de R$ 29,90/mês.",
    url: "https://nexo-study-app-449.netlify.app",
    siteName: "Nexo Study",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexo Study — organize seus estudos",
    description: "Matérias, atividades, provas, caderno e modo foco num só painel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        {/* Aplica o tema escuro antes da primeira pintura, evitando "flash".
            A lista de rotas públicas é a mesma de lib/ui/tema.ts — precisa
            ficar duplicada aqui porque este script roda antes de qualquer
            JavaScript da aplicação carregar. Mudou lá? Muda aqui também. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var p=location.pathname.replace(/\\/+$/,'')||'/';" +
              "var pub=['/login','/privacidade','/termos','/obrigado','/admin'];" +
              "var app=p!=='/'&&!pub.some(function(x){return p===x||p.indexOf(x+'/')===0});" +
              "if(app&&localStorage.getItem('sf_tema')==='escuro')" +
              "document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
        <TemaPorRota />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
