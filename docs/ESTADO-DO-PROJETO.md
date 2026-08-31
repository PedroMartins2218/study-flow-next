# Nexo Study — estado do projeto

> **Para começar um chat novo:** leia este arquivo inteiro antes de tocar em
> qualquer código. Ele é o retrato completo de 31/08/2026.
> O `CONTEXTO.md` na raiz é o diário do projeto (histórico por data); este aqui é
> o retrato do estado atual.

---

## 1. Antes de qualquer coisa

### ⚠️ Trabalhe na pasta certa
Pasta atual do clone (após a formatação de 31/08/2026):

```
C:\Users\pedri\OneDrive\Área de Trabalho\study-flow-next
```

As duas pastas antigas em `Downloads` (`-repo` e `-main`) **não existem mais** —
a formatação limpou a confusão. Ainda assim, confirme com
`git rev-parse --show-toplevel` antes de editar o `.env.local`: ele já foi
editado na pasta errada **quatro vezes** no histórico do projeto.

### Regras do projeto
- **Poucos commits.** Créditos do Netlify apertados; nada de push "pra testar".
- **Toda alteração termina com o `CONTEXTO.md` atualizado** (convenção do projeto).
- **Antes de escrever código Next.js**, ler o guia em `node_modules/next/dist/docs/`
  — esta versão tem breaking changes (`AGENTS.md` avisa).
- Comentários e mensagens de commit em **pt-BR**.

---

## 2. O produto

SaaS brasileiro de organização de estudos. Fundador solo: Pedro Martins.
Lançado em 08/07/2026. Produção: https://nexo-study-app-449.netlify.app

**Chamava-se Study Flow até 31/08/2026.** O rebrand veio da seleção do projeto
para a **PGTEC**, feira de tecnologia sustentável de Praia Grande, onde ele não
pode ser anunciado como produto pago. O nome novo o liga ao futuro **ecossistema
Nexo** e libera a monetização em paralelo. A identidade visual não mudou.

**Planos:** Base R$ 29,90 e Pro R$ 49,90 (Pro = Agente de IA), via **Kirvano** —
⚠️ com a troca pela **Cacto** em avaliação, já que o checkout nunca funcionou
(ver `docs/PENDENCIAS.md`).

**Telas:** Dashboard, Matérias, Atividades, Trabalhos, Provas, Caderno, Gráficos,
Foco, Agente de IA, Configurações, Assinatura. Mais `/admin` (reservas),
landing pública e `/obrigado` (pós-compra).

---

## 3. Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind v4
- **Firebase**: Auth (e-mail/senha) + Firestore + Admin SDK no servidor
- **Zod** para validação, **Recharts** para gráficos
- **Gemini** via REST (sem SDK) para a IA
- **Netlify** para deploy
- Sem biblioteca de drag-and-drop, sem jsPDF, sem Firebase Storage — tudo
  resolvido com recurso nativo, de propósito (custo e tamanho de bundle)

---

## 4. Mapa do código

```
src/
  lib/
    launch.ts                  data do lançamento (fonte única)
    planos.ts                  PREÇO E COPY DOS PLANOS (fonte única)
    firebase/client.ts         Firebase do navegador
    firebase/admin.ts          Admin SDK (server-only)
    auth/AuthProvider.tsx      contexto de auth
    auth/autenticarRequisicao.ts  verifica ID token nas rotas de API
    data/assinaturaCore.ts     ⭐ REGRAS DE ACESSO puras (sem Firebase)
    data/assinaturaAdmin.ts    leitura/escrita de assinatura (servidor)
    data/kirvanoWebhook.ts     máquina de estados do pagamento
    data/usoIaAdmin.ts         cota de IA (transacional)
    data/conversas.ts          conversas e mensagens do chat
    data/anexos.ts             anexos do caderno
    data/*.ts                  uma camada por entidade
    ia/gemini.ts               chamadas ao Gemini
    ui/datas.ts                ⭐ datas no fuso de Brasília
    ui/estatisticas.ts         agregações de foco
    ui/imagem.ts               compressão de imagem
  app/
    page.tsx                   landing de vendas
    obrigado/                  destino pós-checkout
    (auth)/login/              login e cadastro
    (dashboard)/               app protegido
    api/kirvano/webhook/       recebe pagamento
    api/assinatura/sincronizar/  libera compra pendente
    api/ia/chat|extrair|resumir/ rotas do Agente
  components/
    ui/Modal.tsx               janela de criar/editar (substituiu o SlideOver)
    ui/HeatmapFoco.tsx         calendário de constância
    tarefas/TelaTarefas.tsx    quadro Kanban (Atividades e Trabalhos)
    ia/CartaoTarefas.tsx       cartão de confirmação do chat
    caderno/Anexos.tsx         imagens da anotação
```

---

## 5. Monetização (como funciona)

```
landing (#planos) → checkout Kirvano → SALE_APPROVED (webhook)
  → conta existe?  sim → grava assinaturas/{uid}
                   não → grava assinaturasPendentes/{email}
  → /obrigado → cria conta com o MESMO e-mail → /api/assinatura/sincronizar
  → acesso liberado
```

O checkout é hospedado pela Kirvano de propósito: dados de cartão nunca passam
pelo nosso domínio (evita PCI-DSS).

**Coleções no Firestore** (todas fechadas ao cliente — ver `firestore.rules`):

| Coleção | Para quê |
|---|---|
| `assinaturas/{uid}` | status, `tier` (base/pro), expiração |
| `assinaturasPendentes/{email}` | compra aguardando cadastro |
| `pagamentos/{evento}_{sale_id}` | ledger + **idempotência** |
| `usoIa/{uid}` | cota mensal do Agente |
| `usuarios/{uid}/...` | dados do estudante (subcoleções) |

**Estados da assinatura:** `ativo`, `trial`, `inadimplente`, `cancelado`,
`expirado`, `inativo`. Inadimplente e cancelado mantêm acesso até `expiracao`;
chargeback e reembolso gravam **ontem** e cortam na hora.

**Webhook testado** contra o Firestore real: compra sem conta → pendente;
reentrega do mesmo evento → não duplica; chargeback → remove pendência;
`PIX_GENERATED` → não mexe no acesso. Sem token → 401.

---

## 6. Agente de IA

Chat com histórico, exclusivo do plano Pro.

- `POST /api/ia/chat` — auth → `tier === "pro"` **no servidor** → reserva cota →
  Gemini → valida com Zod → estorna a cota se falhar
- Só as **últimas 20 mensagens** viram contexto (teto de custo por turno)
- Resposta estruturada `{ resposta, tarefas[] }`: quando a pessoa menciona
  prazos, aparece um cartão para **confirmar** — o agente nunca grava sozinho
- Respostas longas (200+ caracteres) ganham botão **Baixar PDF**, via
  `window.print()` e `@media print`, sem biblioteca
- **Temperatura por operação:** 0.1 em extração/resumo (fidelidade), 0.6 no chat
  (com 0.1 a conversa saía dura)
- Testado: memória entre turnos, uso das matérias cadastradas, recusa de injeção
  de prompt

⚠️ **Modelo:** usar sempre alias `-latest`. `gemini-2.5-flash` e
`2.5-flash-lite` **saíram do ar para contas novas**. Hoje:
`gemini-flash-lite-latest`.

---

## 7. Armadilhas já pagas (não repetir)

### Datas em UTC
`toISOString().split("T")[0]` devolve a data em **UTC**. Às 21h de Brasília já é
o dia seguinte. Isso fazia a sessão de foco da noite ser gravada como "amanhã",
zerando o foco do dia e quebrando a sequência.
👉 Sempre `hojeISO()` / `dataLocalISO()` de `lib/ui/datas.ts`.

### Cronômetro somando tiques
`setInterval` decrementando um contador **congela** com a tela do celular
bloqueada. Simulação: bloco de 30 min com a tela travada registrava **6 min**.
👉 Guardar o instante de término e calcular por `Date.now()`, recalculando no
`visibilitychange`.

### `mx-auto` em filho de flex
Margem automática no eixo transversal **desativa o stretch**: o elemento passa a
ter a largura do CONTEÚDO. O Kanban inflou o container para 1012px numa tela de
375 e a página inteira rolava de lado.
👉 Sempre `mx-auto w-full max-w-...`, nunca `mx-auto max-w-...` sozinho.

### Tema escuro casa pelo nome exato da classe
`globals.css` sobrescreve `.dark .bg-slate-50`. **`bg-slate-50/60` não é a mesma
classe** e fica clara no escuro, apagando o texto.
👉 Fundos grandes só com `bg-white`, `bg-slate-50` ou `bg-slate-100`, sem opacidade.

### Chave privada com escape duplo
Chave do Firebase Admin colada com `\\n` quebrava o SDK com *"Failed to parse
private key"*. `normalizarPrivateKey` agora aceita `\\n` e `\n`.

### `Date.now()` no corpo do componente
A regra `react-hooks/purity` barra. Extrair para função de módulo.

### Firestore não apaga subcoleção em cascata
Ao apagar anotação ou conversa, apagar antes os anexos/mensagens em lote.

---

## 8. O que está pronto

**Monetização:** webhook com idempotência, planos Base/Pro, liberação automática
de acesso, tela de assinatura, `/obrigado`, login com e-mail pré-preenchido.

**Agente de IA:** chat com histórico, cartões de tarefa, PDF, cota mensal.

**Produto:** modal centralizado em todas as telas, edição em Atividades /
Trabalhos / Provas, quadro Kanban de 3 colunas, progresso da matéria com + e −,
capa nas matérias, anexos de imagem no caderno, Modo Foco com blocos de
15/25/30/50 e modo descanso, gráficos com heatmap de constância.

**Qualidade:** `tsc`, `eslint --max-warnings=0` e `next build` limpos.

---

## 9. O que falta

Ver **`docs/PENDENCIAS.md`** — detalhado, com caixas para marcar.

Resumo: o checkout da Kirvano está quebrado **do lado deles** e trava a
finalização do pagamento; as regras do Firestore precisam ser publicadas; as
variáveis precisam ir para o Netlify; **nada foi commitado ainda**.

---

## 10. Como rodar

```bash
cd "C:\Users\pedri\OneDrive\Área de Trabalho\study-flow-next"
npm install
npm run dev
```

Precisa do `.env.local` (não versionado). Conferir com:

```bash
npm run checar-env
```

Para testar no celular pela rede local, o IP da máquina precisa estar em
`allowedDevOrigins` no `next.config.ts` (hoje: 192.168.0.88).

**Comandos úteis**

| Comando | Para quê |
|---|---|
| `npm run checar-env` | confere o `.env.local` sem exibir segredos |
| `npm run assinatura -- <email> ativo pro` | libera acesso manualmente |
| `npx tsc --noEmit` | tipagem |
| `npx eslint src --max-warnings=0` | lint |
