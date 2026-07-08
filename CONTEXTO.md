# Study Flow — Contexto do projeto

> **Regra de ouro (trabalho em 2 máquinas):** este arquivo é a fonte de verdade
> do estado do projeto. **Toda atualização no sistema deve terminar com este
> arquivo atualizado e commitado junto.** Ao começar a trabalhar em qualquer
> máquina: `git pull` e leia a seção "Últimas atualizações".
>
> **Última atualização:** 07/07/2026 — responsividade mobile completa, nav
> estilo app, erros de login visíveis, remoção do login com Google.

---

## O que é o Study Flow

SaaS brasileiro de organização de estudos — o "painel operacional do estudante"
(vestibulandos, concurseiros, universitários). Organiza matérias, atividades,
trabalhos, provas/simulados, caderno de anotações e sessões de foco (Pomodoro),
com gráficos de evolução. Não é cursinho; a promessa é estrutura, clareza e
constância (nunca prometer aprovação).

- **Produção:** https://study-flow-app-449.netlify.app
- **Repositório:** github.com/PedroMartins2218/study-flow-next (público)
- **Fundador:** Pedro Martins (solo)

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **Firebase:** Auth (e-mail/senha) + Firestore (dados) + Admin SDK (server)
- **Zod** para validação; **Recharts** para gráficos
- **Netlify** (deploy automático a cada push na `main`)

## Como rodar numa máquina nova

1. `git clone` do repo e `npm install` dentro de `study-flow-next/`
2. Copiar **manualmente** (NUNCA commitá-los — estão no .gitignore):
   - `.env.local` — todas as chaves (Firebase client, Admin, ADMIN_SECRET)
   - `.github-token` e `.netlify-token` — tokens de deploy/admin
3. `npm run dev` → http://localhost:3000
4. Para testar pelo celular na rede local: o IP da máquina precisa estar em
   `allowedDevOrigins` no `next.config.ts` (hoje: 192.168.0.68)

Scripts úteis: `npm run assinatura -- <email> <ativo|inativo|trial> [data] [plano]`
(ativa assinatura manualmente via Admin SDK).

## Estrutura do código (mapa rápido)

```
src/
  lib/launch.ts            ← DATA DO LANÇAMENTO (fonte única: countdown, trava
                              de reservas e liberação do trial)
  lib/firebase/client.ts   ← Firebase client (lazy init)
  lib/firebase/admin.ts    ← Admin SDK (server-only; limpa aspas/vírgula das envs)
  lib/data/*.ts            ← camada de dados (1 arquivo por entidade)
  lib/auth/AuthProvider.tsx← contexto de auth (login/registrar/logout)
  lib/perfil/              ← foto de perfil (Firestore, base64 160px, sem custo)
  app/page.tsx             ← landing/página de vendas (+ components/marketing/)
  app/(auth)/login/        ← login/cadastro (só e-mail/senha)
  app/(dashboard)/         ← app protegido (8 telas) + layout com trava de
                              assinatura (ativo|trial) e providers (Toast,
                              Confirm, Perfil, Lembretes)
  app/admin/               ← painel de reservas (protegido por ADMIN_SECRET)
  app/api/reserva/         ← grava reservas (trava após o lançamento)
  app/api/trial/ativar/    ← ativa trial 7 dias (só reservados, pós-lançamento)
  app/api/kirvano/webhook/ ← esqueleto do webhook de pagamento (aguarda payload)
  components/ui/           ← primitivos (Botao, Badge, SlideOver, Toast,
                              ConfirmDialog, Skeleton, EmptyState, Icone...)
  components/layout/DashboardShell.tsx ← sidebar desktop + nav mobile fixa
firestore.rules            ← publicadas em produção (dados por usuário;
                              assinaturas read-only no client)
```

## Estado atual (~97%)

**Pronto e no ar:**
- Sistema completo: dashboard vivo (streak, onboarding), matérias, atividades,
  trabalhos, provas (contagem regressiva), caderno, foco (anel animado, som,
  15/25/50min), gráficos, configurações (nome, foto, notificações, tema)
- Dark mode uniforme (claro = tudo claro; sidebar escura nos 2 temas)
- Polish: toasts, confirmação de exclusão, skeletons, animações, estados vazios
- **Mobile:** responsivo de verdade — nav inferior fixa (Dashboard, Matérias,
  Atividades, Foco + "Mais" em bottom sheet), sem overflow em nenhuma tela
- Landing com countdown, seção "Veja por dentro", OG image (preview no WhatsApp)
- Captação: formulário de reserva → Firestore; painel /admin com CSV
- **Lançamento 08/07/2026 10:00** (lib/launch.ts): reservas travam sozinhas e o
  trial de 7 dias libera sozinho (exclusivo para e-mails na coleção `reservas`)
- Notificações locais de provas/tarefas (1x/dia ao abrir o app, configurável)

**Decisões importantes:**
- Trial exclusivo para quem reservou; demais usuários caem no paywall
- Kirvano será a ÚLTIMA integração (ninguém paga antes dos 7 dias de teste)
- Domínio próprio: adiado até o sistema dar resultado
- Depoimentos fictícios: proibidos (seção "para quem é" usa cenários de uso)

## Deploy e créditos Netlify ⚠️

- Push na `main` → build automática no Netlify (site: study-flow-app-449)
- **Créditos do plano grátis passaram de 75%** → fazer POUCOS commits, sempre
  em blocos completos e testados localmente antes (build + preview + aprovação
  do Pedro). Nada de push "pra testar".
- Env vars já configuradas no Netlify (Firebase client + Admin + ADMIN_SECRET;
  usar `netlify env:set --force -- CHAVE valor` — o env:import corrompe aspas)

## Últimas atualizações (07/07/2026)

1. **Mobile responsivo:** corrigido overflow horizontal (faltava `min-w-0` no
   flex; a nav antiga de 8 itens alargava a página). Nova nav inferior fixa
   estilo app + menu "Mais" (sheet com Trabalhos, Provas, Caderno, Gráficos,
   Config, Assinatura, Sair). Auditadas todas as telas em 375px: zero overflow.
2. **Login:** erros sempre visíveis (mais códigos do Firebase mapeados +
   scroll automático até a mensagem no celular). Removido "Continuar com
   Google" (front + AuthProvider) — opção não existe no produto.
3. `allowedDevOrigins` no next.config.ts para testar via celular na rede local
   (o Next 16 bloqueia origens ≠ localhost no dev por padrão).
4. Lançamento adiado de 06/07 para **08/07 10:00** (baixa adesão; reservas
   reabertas automaticamente).

## Próximos passos (ordem recomendada)

1. **E-mail aos reservados no lançamento** (Resend, plano grátis): avisar que o
   acesso abriu + link para criar conta e ativar o trial. Pedro precisa criar
   conta no resend.com e gerar API key.
2. **Pós-lançamento (08/07):** monitorar /admin e conversão dos 7 dias.
3. **Kirvano (última integração):** página de vendas definitiva para publicar
   na Kirvano; payload real do webhook (`extrairEmail`/`normalizarStatus` em
   app/api/kirvano/webhook/route.ts); env `NEXT_PUBLIC_KIRVANO_CHECKOUT_URL` e
   `KIRVANO_WEBHOOK_SECRET`; gravar plano estruturado (mensal/anual) p/ gating
   futuro do Agente de IA (exclusivo anual, "em breve").
4. **Tela de trial expirado → checkout** (depende da Kirvano).
5. **Segurança final:** rate limit em /api/reserva, App Check, revisão de rules.
6. **Stand-by:** domínio próprio; push notifications com app fechado (FCM).

## Fluxo de trabalho (setores)

- **Chat dev do sistema:** todo o código, commits, push e deploy (ÚNICO que
  publica).
- **Chat da página de vendas:** edita só `app/page.tsx` + `components/marketing/`;
  não commita — o dev revisa e publica.
- **Chat de marketing/conteúdo:** copy, posts, mensagens; não toca em código.
- Convenção de commits: mensagens em pt-BR, prefixos `feat:`/`fix:`/`chore:`.
