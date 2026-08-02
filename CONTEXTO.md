# Study Flow — Contexto do projeto

> **Regra de ouro (trabalho em 2 máquinas):** este arquivo é a fonte de verdade
> do estado do projeto. **Toda atualização no sistema deve terminar com este
> arquivo atualizado e commitado junto.** Ao começar a trabalhar em qualquer
> máquina: `git pull` e leia a seção "Últimas atualizações".
>
> **Última atualização:** 02/08/2026 — landing de vendas redesenhada (plano
> único R$ 19,90/mês, sem countdown/reserva) e /assinatura corrigida pra quem
> não reservou poder pagar direto.

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
- Landing de vendas pós-lançamento (app/page.tsx): hero com print real do
  dashboard, "para quem é", plano único R$19,90/mês, FAQ, OG image (preview no
  WhatsApp). Sem countdown/reserva — CTAs levam pra /login
- Captação (histórico, ainda ativa): formulário de reserva continua em
  /api/reserva + painel /admin com CSV; só não aparece mais na landing
- **Lançamento 08/07/2026 10:00** (lib/launch.ts): reservas travam sozinhas e o
  trial de 7 dias libera sozinho (exclusivo para e-mails na coleção `reservas`)
- Notificações locais de provas/tarefas (1x/dia ao abrir o app, configurável)

**Decisões importantes:**
- Trial de 7 dias exclusivo para quem reservou antes do lançamento; quem
  assina agora (pós-lançamento) paga direto, R$19,90/mês, sem trial
- Kirvano já integrada ao fluxo real: /assinatura manda quem não tem trial
  direto pro checkout (`NEXT_PUBLIC_KIRVANO_CHECKOUT_URL`); falta confirmar
  em produção o payload real do webhook com um pagamento de teste
- Plano anual removido por enquanto — só mensal R$19,90; "Agente de IA
  próprio" fica como bônus futuro do plano único, marcado "(em breve)"
- Domínio próprio: adiado até o sistema dar resultado
- Depoimentos fictícios: proibidos (seção "para quem é" usa cenários de uso)

## Deploy e créditos Netlify ⚠️

- Push na `main` → build automática no Netlify (site: study-flow-app-449)
- **Créditos do plano grátis passaram de 75%** → fazer POUCOS commits, sempre
  em blocos completos e testados localmente antes (build + preview + aprovação
  do Pedro). Nada de push "pra testar".
- Env vars já configuradas no Netlify (Firebase client + Admin + ADMIN_SECRET;
  usar `netlify env:set --force -- CHAVE valor` — o env:import corrompe aspas)

## Últimas atualizações (02/08/2026)

1. **Landing de vendas redesenhada** (`src/app/page.tsx`): hero com print real
   do dashboard (recortado, sem nome/e-mail visíveis), seção "O problema",
   funcionalidades, "para quem é", plano único **R$19,90/mês** (removido o
   anual), FAQ nova. Todos os CTAs levam pra `/login` — o checkout da Kirvano
   só aparece depois de logar, pra casar o e-mail no webhook.
2. **Removida a lógica de pré-lançamento da home:** countdown, formulário de
   reserva e a prévia falsa em CSS saíram da landing. Componentes deletados
   por ficarem sem uso: `CountdownTimer.tsx`, `ReservaForm.tsx`,
   `PreviewApp.tsx`. O endpoint `/api/reserva` e o painel `/admin` continuam
   ativos (histórico usado pela elegibilidade do trial).
3. **Corrigido `/assinatura`:** quem nunca assinou e não reservou agora vê o
   botão "Assinar agora" (checkout Kirvano) direto, em vez de só a oferta de
   trial — que retornava erro sem alternativa pra quem não estava na lista de
   reservas.
4. `public/marketing/dashboard-preview.png` adicionado (print usado no hero).

## Próximos passos (ordem recomendada)

1. **Kirvano:** confirmar no Netlify que `NEXT_PUBLIC_KIRVANO_CHECKOUT_URL` e
   `KIRVANO_WEBHOOK_SECRET` estão configurados; validar o payload real do
   webhook (`extrairEmail`/`normalizarStatus` em
   `app/api/kirvano/webhook/route.ts`) com um pagamento de teste de verdade.
2. **Pós-lançamento:** monitorar `/admin` e conversão dos 7 dias de trial.
3. **Segurança final:** rate limit em `/api/reserva`, App Check, revisão de
   rules.
4. **Stand-by:** domínio próprio; push notifications com app fechado (FCM).

## Fluxo de trabalho (setores)

- **Chat dev do sistema:** todo o código, commits, push e deploy (ÚNICO que
  publica).
- **Chat da página de vendas:** edita só `app/page.tsx` + `components/marketing/`;
  não commita — o dev revisa e publica.
- **Chat de marketing/conteúdo:** copy, posts, mensagens; não toca em código.
- Convenção de commits: mensagens em pt-BR, prefixos `feat:`/`fix:`/`chore:`.
