# Study Flow — Next.js

Nova base do Study Flow, em reconstrução a partir do MVP estático
(`index.html` / `dashboard.html`, na raiz do repositório). Essa versão antiga
continua no ar e não deve ser apagada — este projeto é desenvolvido em
paralelo até estar pronto para substituí-la.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Firebase Auth + Firestore (client)
- Firebase Admin SDK (server-only, usado a partir da fase 2/3)
- Zod para validação de dados

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env.local` e preencha com as credenciais do
   projeto Firebase (Console Firebase > Configurações do projeto > Seus
   apps > Web). As variáveis `NEXT_PUBLIC_FIREBASE_*` são públicas e seguras
   de expor no navegador — é assim que o SDK client do Firebase funciona.
   As variáveis `FIREBASE_ADMIN_*` são secretas, usadas só no servidor, e só
   serão necessárias a partir da fase 2 (validação de assinatura) — **nunca
   as commite**.
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra [http://localhost:3000](http://localhost:3000). A rota `/` redireciona
   para `/login`.

## Estrutura

```
src/
  app/
    (auth)/login/        # Login e cadastro (email/senha + Google)
    (dashboard)/          # Rotas protegidas: dashboard, materias, atividades
  components/layout/      # Shell do dashboard (sidebar/topbar)
  lib/
    firebase/client.ts    # Firebase client (Auth + Firestore)
    firebase/admin.ts     # Firebase Admin — SERVER ONLY, nunca importar em Client Components
    auth/AuthProvider.tsx  # Contexto de autenticação (useAuth)
    data/                 # CRUD tipado por coleção (materias, atividades)
    validators/           # Schemas Zod para validar dados antes de salvar
  types/studyflow.ts       # Tipos de domínio (Materia, Atividade, ...)
firestore.rules            # Regras de segurança do Firestore
```

## Modelo de dados

Coleções indexadas por `uid` do Firebase Auth (não por e-mail):

```
usuarios/{uid}
usuarios/{uid}/materias/{id}
usuarios/{uid}/atividades/{id}
usuarios/{uid}/trabalhos/{id}      (fase 2)
usuarios/{uid}/provas/{id}         (fase 2)
usuarios/{uid}/sessoes/{id}        (fase 2)
assinaturas/{uid}                  (fase 2/3 — leitura do cliente, escrita só via Admin SDK)
```

As `firestore.rules` garantem que cada usuário só lê/escreve os próprios
dados, e que `assinaturas/{uid}` nunca é escrito pelo cliente.

## Publicando as regras do Firestore

Requer login local via Firebase CLI (`firebase login`) feito pelo
responsável pelo projeto — nunca compartilhe credenciais de conta Google ou
o JSON da service account:

```bash
firebase deploy --only firestore:rules --project <project-id>
```

## Deploy

Ainda não configurado. O plano é publicar em uma URL separada da versão
atual (Netlify) até que a migração de dados e a validação de assinatura
server-side estejam prontas — só então a versão antiga (`index.html`,
`dashboard.html`) será substituída.

## Status

Fase 1 em andamento: autenticação, rotas protegidas, layout base e CRUD de
matérias/atividades por `uid`. Ver histórico de commits e tarefas para o
que falta das fases 2 e 3 (trabalhos, provas, sessões de foco, gráficos,
validação de assinatura server-side, integração Kirvano).
