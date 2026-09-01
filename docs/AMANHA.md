# Roteiro para a próxima sessão — preparado em 31/08/2026

> Tudo abaixo está **pronto para executar**. O código está commitado na branch
> `rebrand-nexo-study`; a `main` e a produção seguem intocadas de propósito.
>
> **Comece lendo isto, não o `CONTEXTO.md`.** Quando terminar, apague este
> arquivo e registre o que foi feito no `CONTEXTO.md`.

---

## Onde as coisas pararam

| | Local | Produção |
|---|---|---|
| Marca Nexo Study | pronto | ainda "Study Flow" |
| Webhook da Cakto | testado | rota não existe (404) |
| Plano vitalício | testado | não existe |
| Variáveis da Cakto | 6 preenchidas | nenhuma |

A produção roda o commit `a12e068`, de 20/08. Nada do que fizemos em 31/08
está no ar — e isso é intencional: primeiro a validação de segurança, depois o
merge.

---

## Passo 1 — Variáveis no Netlify (~10 min)

### 1a. Apagar as 5 variáveis mortas

A migração renomeou tudo de `KIRVANO_*` para `CAKTO_*`. Estas ficaram órfãs no
painel e o código não lê nenhuma delas:

```
NEXT_PUBLIC_KIRVANO_CHECKOUT_BASE_URL
NEXT_PUBLIC_KIRVANO_CHECKOUT_PRO_URL
KIRVANO_OFERTA_BASE_ID
KIRVANO_OFERTA_PRO_ID
KIRVANO_WEBHOOK_TOKEN
```

### 1b. Adicionar as 6 da Cakto

Rode isto para gerar os comandos já preenchidos a partir do `.env.local`:

```
npm run netlify-env
```

O script imprime os `netlify env:set` prontos para colar. Ele lê os valores do
`.env.local` (que não é versionado) — nenhum segredo fica escrito em arquivo
commitado.

**Pelo painel, se preferir** (mais simples, e evita a armadilha do `env:import`
corromper aspas): app.netlify.com → site `nexo-study-app-449` → Site
configuration → Environment variables.

Ao colar: sem aspas, sem espaço nas pontas, sem vírgula no fim.
Marque como secreta **só** a `CAKTO_WEBHOOK_SECRET` — as `NEXT_PUBLIC_`
precisam ficar legíveis para o build.

### 1c. Conferir

`npm run checar-env` valida o formato local. Para o Netlify, confira que a
lista final tem 17 variáveis (11 antigas do Firebase/Gemini + 6 da Cakto) e
nenhuma `KIRVANO_`.

---

## Passo 2 — Validação de segurança (o grosso do dia)

Roteiro completo no artefato **Blindagem do Nexo Study** — 32 verificações em
8 fases, com o que testar, como testar e o critério de aprovação de cada uma.

**Ordem sugerida:**

1. **Fase 1 — isolamento entre usuários.** As duas contas de teste já existem
   (`testador1@example.com` / `testador2@example.com`, senhas
   `NexoTeste1#2026` e `NexoTeste2#2026`), que é exatamente o que o item A1
   pede: logar como uma e tentar ler os dados da outra pelo console.
2. **Fase 2 — acesso pago.** Agora dá para testar de verdade, com a Cakto
   funcionando.
3. **Fase 5 — varrer o histórico do git** atrás de segredo já commitado.
   Rápido e importante: o repositório é público, e o que entrou um dia fica
   visível para sempre.
4. **Fases 3 e 4** — rotas de API e painel administrativo.

**A régua para liberar as vendas:** zero itens Críticos em aberto (são 10:
A1, A2, A3, B1, B2, C1, C2, E1, E2, G1).

---

## Passo 3 — Entrega do acesso ao comprador

**O problema:** hoje o fluxo depende inteiramente de a pessoa não fechar a aba.
Ela paga, é redirecionada para `/obrigado`, e lá é instruída a criar conta com
o mesmo e-mail. **Se fechar antes, não recebe nada** — nenhum e-mail nosso é
enviado. Não existe um segundo caminho.

Investigar nesta ordem, parando no primeiro que resolver:

1. **A Cakto redireciona para uma URL nossa?**
   Apontar para `https://nexo-study-app-449.netlify.app/obrigado`.
   Descobrir também **se ela passa o e-mail da compra na URL** — se passar, dá
   para pré-preencher o cadastro e cortar quase todo o risco de a pessoa
   digitar um e-mail diferente do que usou na compra.
2. **A Cakto manda e-mail de confirmação, e dá para personalizar?**
   Se couber o link do app e a instrução do "use o mesmo e-mail", resolve
   barato, sem código.
3. **Se nenhum dos dois servir: e-mail próprio** (Resend, já nas ideias).
   No `purchase_approved`, disparar um e-mail com o link e as instruções.
   Mais trabalho, mas é o único caminho robusto — e depois serve também para
   avisar inadimplência.

⚠️ **Isto conversa direto com o item B2 da validação.** Hoje o casamento entre
compra e conta é feito só pelo e-mail, sem nenhuma verificação — confirmado que
o Firebase aceita e-mail inventado. Resolver a entrega e resolver o B2 são,
provavelmente, o mesmo trabalho.

---

## Passo 4 — Só depois de tudo acima: publicar

1. **Recapturar `public/marketing/dashboard-preview.png`** — o print do hero
   ainda mostra "Study Flow" na sidebar. Rodar local, logar, capturar de novo,
   recortando o nome do usuário.
2. **Merge da branch `rebrand-nexo-study` na `main`** e push.
   Uma única build do Netlify. ⚠️ Créditos acima de 75%.
3. **Depois do deploy:** cadastrar o webhook no painel da Cakto apontando para
   `https://nexo-study-app-449.netlify.app/api/cakto/webhook` e disparar um
   evento de teste. Antes do merge essa rota não existe — o evento bateria em
   404.
4. **Avisar a testadora** do endereço novo: o link antigo
   (`study-flow-app-449`) responde 404 desde o rebrand.

---

## Pontas soltas menores

- **Gerar um `CAKTO_WEBHOOK_SECRET` novo** antes de abrir as vendas: o atual
  apareceu no terminal durante a configuração.
- **Trocar a senha da conta admin** (foi digitada num chat).
- **Apagar as contas de teste** quando terminarem.
- **Decidir a copy da imagem OG** — o preview do WhatsApp ainda diz
  "pré-lançamento".
- **`.gitattributes`** para normalizar fim de linha entre as duas máquinas
  (você trabalha em casa e no trabalho; sem isso, arquivos aparecem
  modificados sem motivo).
