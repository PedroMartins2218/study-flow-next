# Retomar aqui

> **Leia este arquivo antes de qualquer outro.** Ele diz onde o trabalho parou.
> Última atualização: **01/09/2026**.
>
> Histórico detalhado fica no `CONTEXTO.md`. Lista completa de pendências, no
> `docs/PENDENCIAS.md`. Este aqui é só o "por onde continuar".

---

## O estado, em uma tabela

| | Código (branch `rebrand-nexo-study`) | Produção (`main`) |
|---|---|---|
| Marca Nexo Study | pronto | ainda "Study Flow" |
| Gateway Cakto | pronto e testado | rota não existe (404) |
| Plano vitalício | pronto e testado | não existe |
| Correções de segurança | prontas e testadas | não existem |
| Páginas legais (LGPD) | prontas | não existem |
| Exclusão de conta | pronta e testada | não existe |

**A produção roda o commit `a12e068`, de 20/08.** Nada do que foi feito em 31/08
e 01/09 está no ar. Isso é intencional — falta o passo do Netlify e o merge.

**Exceção importante:** as `firestore.rules` **já estão publicadas** em produção
(01/09). Regras não passam por deploy do Netlify, vão direto para o Firebase.

---

## Segurança — onde paramos

A validação foi **executada em 01/09/2026**. O roteiro completo continua no
artefato **Blindagem do Nexo Study** (32 verificações).

### Resolvido e provado

| Item | O que era |
|---|---|
| **A1, A3, A4, A5** | Isolamento entre contas, assinatura read-only, ledger fechado, regras publicadas conferidas |
| **A2** | Regra aceitava e-mail não verificado como dono. Migrados 7 usuários, regra reduzida a só `uid`, publicada. Ataque controlado devolve 403 |
| **B2** | Compra podia ser reivindicada por quem registrasse o e-mail primeiro. Agora exige e-mail confirmado — só quando há compra pendente |
| **C1, C2** | Rotas exigem login; plano Pro travado no servidor |
| **C3** | `POST /api/reserva` removida (única rota pública sem autenticação) |
| **D1, D4** | Chave do admin não é mais aceita pela URL; comparação de tempo constante |
| **E1, E2** | Nenhum segredo no histórico do git nem no bundle do navegador |
| **F1** | Sem caminho de injeção de HTML |
| **G1** | `/privacidade`, `/termos`, exclusão de conta e aviso do Gemini |

### Falta — e depende do Pedro

- [ ] **Rotacionar credenciais na véspera do lançamento**: chave da conta de
      serviço do Firebase, chave do Gemini, `ADMIN_SECRET` e
      `CAKTO_WEBHOOK_SECRET`. **Revogar as antigas**, não só gerar novas
- [ ] **Revisão jurídica** de `/privacidade` e `/termos` — o texto reflete o
      sistema, mas não é parecer de advogado, e o tema de menores é sensível
- [ ] **Preencher o e-mail de suporte** citado nas duas páginas legais
- [ ] **Trocar a senha da conta admin** (foi digitada num chat)
- [ ] **Apagar as contas de teste**: `testador1@example.com`,
      `testador2@example.com`, `teste-verificacao-claude@studyflow.com`
- [ ] **Apagar os 7 documentos legados** `usuarios/{email}` depois de confirmar
      que aqueles usuários acessam normalmente
      (backup em `../backup-usuarios-legado-2026-09-01.json`, fora do repo)
- [ ] **Limitador de requisições** — adiado por decisão consciente. Reavaliar
      quando houver volume real

---

## Próximos passos, na ordem

### 1. ~~Variáveis no Netlify~~ — FEITO em 01/09/2026

As 19 variáveis estão cadastradas e as 5 órfãs da Kirvano foram removidas.
O `CAKTO_WEBHOOK_SECRET` ficou com escopo Builds/Functions/Runtime e valor
em Production — confirmado, é o que o webhook precisa.
⚠️ As duas `NEXT_PUBLIC_CAKTO_CHECKOUT_*` só passam a valer no próximo build.

### 2. ~~Entrega do acesso ao comprador~~ — RESOLVIDO sem código

A Cakto entrega sozinha. No cadastro do produto, na etapa de entrega, ela
oferece **"Acesso por e-mail"**: o cliente recebe o link automaticamente no
e-mail "Pagamento Confirmado", disparado logo após a aprovação. Pedro
configurou em 01/09.

Assim, quem fechar a aba depois de pagar recebe o link mesmo assim — que era
o buraco. Continua valendo confirmar, no primeiro evento real, **se o webhook
dispara normalmente nesse modo de entrega** (o esperado é que sim: webhooks
são configurados numa seção separada do painel).

### 3. ~~Recapturar o print do hero~~ — FEITO em 01/09/2026

Refeito com Puppeteer, com a marca certa, o e-mail da conta escondido e o
painel "Hoje" com conteúdo. A captura revelou dois bugs reais, já corrigidos:
o gráfico "Foco · últimos 7 dias" nunca renderizou (altura em porcentagem
sobre pai sem altura), e o "Foco hoje" exibia "NaNh NaNmin".

### 4. Testar o webhook de ponta a ponta — **é o próximo passo**

O merge foi feito e o endereço está no ar. Falta:
- [ ] Conferir na Cakto que o webhook aponta para
      `https://nexo-study-app-449.netlify.app/api/cakto/webhook` e que os 10
      eventos estão marcados. **Não criar um segundo webhook** — isso geraria
      um segredo novo e quebraria o que está no Netlify
- [ ] Disparar o evento de teste pelo painel e conferir o resultado
- [ ] Compra real de ponta a ponta, com reembolso depois

### 5. Avisar a testadora

O link antigo (`study-flow-app-449`) responde 404 desde o rebrand.

---

## Contas de teste ativas

| E-mail | Senha | Plano |
|---|---|---|
| `testador1@example.com` | `NexoTeste1#2026` | Pro até 30/09/2026 |
| `testador2@example.com` | `NexoTeste2#2026` | Pro até 30/09/2026 |

Servem também para repetir o teste A1 (isolamento entre contas).

---

## Pontas soltas menores

- Copy da imagem OG ainda diz "pré-lançamento" (aparece no preview do WhatsApp)
- `public/logo.png` tem o wordmark antigo embutido (nenhum componente usa)
- `.gitattributes` para normalizar fim de linha entre as duas máquinas
- Arrastar e soltar do Kanban no desktop nunca foi testado por automação
