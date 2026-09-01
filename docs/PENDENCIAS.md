# Nexo Study — o que ainda falta

> Situação em **31/08/2026**. Documento de trabalho: risque o que concluir.
> O produto se chamava **Study Flow** até 31/08/2026 — ver `CONTEXTO.md`.

---

## 🟡 Configurar a Cakto (o código já está pronto)

A migração da Kirvano para a **Cakto** foi feita em 31/08/2026 e está testada
localmente. O que falta é do lado do painel da Cakto e das variáveis:

- [ ] **Cadastrar o webhook** apontando para
      `https://nexo-study-app-449.netlify.app/api/cakto/webhook`, assinando os
      eventos: `purchase_approved`, `purchase_refused`, `refund`, `chargeback`,
      `subscription_created`, `subscription_renewed`,
      `subscription_renewal_refused`, `subscription_canceled`,
      `subscription_paused`, `subscription_resumed`
- [ ] **Copiar o `secret`** que a Cakto gera para o webhook →
      `CAKTO_WEBHOOK_SECRET`. **Sem ele o endpoint recusa tudo** (falha fechado,
      de propósito)
- [ ] **Copiar os links de checkout** das duas ofertas →
      `NEXT_PUBLIC_CAKTO_CHECKOUT_BASE_URL` e `..._PRO_URL`.
      ⚠️ São `NEXT_PUBLIC_`: ficam embutidas no build, então **exigem rebuild**
      depois de cadastradas no Netlify
- [ ] **Copiar o id de cada oferta** (o valor que vem em `data.offer.id` no
      payload) → `CAKTO_OFERTA_BASE_ID` e `CAKTO_OFERTA_PRO_ID`.
      Sem eles, toda compra é tratada como Base — nunca liberamos Pro no escuro
- [ ] **Cadastrar as 5 variáveis no Netlify** (`netlify env:set --force`, uma a
      uma; o `env:import` corrompe aspas)
- [ ] **Criar a oferta vitalícia na Cakto** (pagamento único, não recorrente),
      copiar o id dela para `CAKTO_OFERTA_VITALICIO_ID` e guardar o link para
      entregar a dedo. O código já está pronto; sem a variável, nenhuma compra
      é tratada como vitalícia
- [ ] **Disparar um evento de teste** pelo painel da Cakto e conferir o log
- [ ] **Compra real de ponta a ponta** e reembolso depois: checkout →
      `/obrigado` → cadastro com o mesmo e-mail → acesso liberado sozinho

✅ O `.env.local` já está com os **valores reais** das 5 variáveis, conferidos
em 31/08: os ids das ofertas batem com o final de cada link de checkout, o
segredo tem formato UUID e os dois links abrem no navegador.
`CAKTO_OFERTA_VITALICIO_ID` segue vazio — a oferta ainda não existe.

---

## 🟡 Pendências do Pedro

- [ ] **Recapturar `public/marketing/dashboard-preview.png`** — o print do hero
      da landing mostra "Study Flow" na sidebar. Rodar local, logar, capturar de
      novo. Aproveitar para recortar o nome do usuário, que aparece no print
      atual
- [ ] **Fazer o merge da branch `rebrand-nexo-study` na `main`** — enquanto isso
      não acontece, a produção continua exibindo "Study Flow"
- [ ] **Redesenhar `public/logo.png`** — tem o wordmark antigo embutido. Sem
      urgência: nenhum componente usa esse arquivo (só o `logo-mark.png`, que é
      só o monograma "ST" e continua válido)
- [ ] **Testar arrastar e soltar no Kanban** (desktop) — não dá para verificar
      por automação
- [ ] **Trocar a senha da conta admin** (foi digitada num chat)
- [ ] **Apagar as contas de teste** quando os testes acabarem
      (`testador1@example.com` e `testador2@example.com`), no Authentication e
      nas coleções `assinaturas` e `usuarios`

---

## 🔴 Antes de abrir as vendas

O plano completo de validação está no artefato **Blindagem do Nexo Study**
(32 verificações em 8 fases). Os itens que bloqueiam o lançamento:

- [ ] **Verificação de e-mail no cadastro** — o fluxo "pagar primeiro, criar
      conta depois" casa compra e conta pelo e-mail. Sem comprovação, quem
      souber o endereço de um comprador pode criar a conta antes dele e receber
      o acesso. Confirmado que o Firebase aceita e-mail inventado sem verificar
- [ ] **Varrer o histórico do git** atrás de segredo já commitado — o
      repositório é público
- [ ] **Rotacionar credenciais** antes de abrir ao público (conta de serviço do
      Firebase, chave do Gemini, `ADMIN_SECRET`)
- [ ] **LGPD** — o público inclui menores de idade. Política de privacidade,
      termos de uso e caminho de exclusão de dados
- [ ] **Rate limit** nas rotas de IA, de reserva e do admin
- [ ] **`/api/admin/reservas` aceita a chave por query string** — vaza em log e
      histórico. Deixar só o cabeçalho

---

## ✅ Concluído desde 08/08/2026

- [x] **Migração da Kirvano para a Cakto** (31/08) — schema Zod do payload real,
      mapa explícito dos 16 eventos, idempotência por `data.id` (chave que a
      própria Cakto recomenda) e validação do `secret` com comparação de tempo
      constante. Testado localmente: sem segredo → 401, segredo errado → 401,
      compra aprovada → pendência gravada, reentrega → não duplica,
      `pix_gerado` → não libera acesso, chargeback → remove a pendência,
      evento desconhecido → ignorado sem quebrar
- [x] **Webhook agora falha FECHADO** (31/08) — o da Kirvano devolvia `true`
      quando a variável de token não estava configurada, ou seja, aceitava
      qualquer origem. O da Cakto recusa
- [x] **Rebrand para Nexo Study** (31/08) — código, metadados e prompt da IA
- [x] **Site do Netlify renomeado** (31/08) — `study-flow-app-449` →
      `nexo-study-app-449`. Confirmado: a nova URL responde 200 e a antiga, 404
- [x] **Publicadas as `firestore.rules`** (20/08) — conferido contra a API de
      Rules do Google: o ruleset em produção é idêntico ao arquivo local
- [x] **`ADMIN_SECRET` preenchido** (20/08) — `/admin` destravado
- [x] **`GEMINI_MODEL` validado** contra a API — `gemini-flash-lite-latest`
      está entre os 50 modelos visíveis à chave
- [x] **Modo Foco testado no celular com a tela bloqueada** (31/08) — o
      cronômetro roda corretamente. Era a única prova real da reescrita que
      trocou a soma de tiques por `fimEm` + `Date.now()`
- [x] **Decisão da tipografia encerrada** (31/08) — mantida a pilha do sistema
      (Arial). A Geist era baixada e nunca usada; o carregamento foi removido,
      economizando duas requisições ao Google Fonts sem mudar um pixel
- [x] **`.env.local` reposto** (31/08) após a formatação da máquina, com o
      Firebase Admin e o Gemini validados por conexão real
- [x] **Checkout quebrado da Kirvano** — resolvido pela migração; era o
      JavaScript da própria Kirvano que quebrava antes de desenhar a tela

---

## 💡 Ideias registradas, sem data

- Toggle **lista ↔ quadro** nas telas de Atividades e Trabalhos (hoje só quadro)
- **Anexos em PDF** no caderno (hoje só imagem; PDF exigiria Firebase Storage,
  que pede plano pago)
- **E-mail transacional** (Resend): confirmação de compra e aviso de inadimplência
- **Firebase App Check**
- **Domínio próprio** — natural agora que a marca mudou; o `.netlify.app` é
  provisório
- **Identidade visual do ecossistema Nexo (preto e branco)** — a marca Nexo é
  P&B, enquanto o produto é azul. Alinhar os dois é possível, mas dá trabalho
  real (paleta, tema escuro, logo, print, peças). **Decisão adiada para depois
  do lançamento** — hoje o azul fica
- Notificações com o app fechado (FCM)
- **Renomear o repositório GitHub** para `nexo-study` — o GitHub redireciona
  sozinho, mas o Netlify precisa ser reconectado ao repo. Não vale o risco agora
