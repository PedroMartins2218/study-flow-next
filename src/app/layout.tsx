import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://study-flow-app-449.netlify.app"),
  title: "Study Flow — organize seus estudos",
  description: "Organize seus estudos, acompanhe sua evolução e transforme foco em resultado.",
  openGraph: {
    title: "Study Flow — organize seus estudos",
    description:
      "Matérias, atividades, provas, caderno e modo foco num só painel. Acesso de fundador em pré-lançamento.",
    url: "https://study-flow-app-449.netlify.app",
    siteName: "Study Flow",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Flow — organize seus estudos",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        {/* Aplica o tema escuro antes da primeira pintura, evitando "flash" */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('sf_tema')==='escuro')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
