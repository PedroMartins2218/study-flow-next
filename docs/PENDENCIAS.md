# Nexo Study — o que ainda falta

> Situação em **01/09/2026**, conferida contra a produção e o Firestore.
> Documento de trabalho: risque o que concluir.
>
> O resumo curto está em `docs/RETOMAR-AQUI.md`. Este aqui é a lista longa.
> O produto se chamava **Study Flow** até 31/08/2026 — ver `CONTEXTO.md`.

---

## 🔴 Bloqueia vender para estranhos

### Não existe e-mail de suporte

`/privacidade` e `/termos` mandam o usuário escrever "para o e-mail de suporte
informado no rodapé do site". **Não existe nenhum endereço de contato no
projeto inteiro** — conferido por varredura. Quem quiser exercer os direitos da
LGPD não tem para onde escrever.

- [ ] Definir um endereço de suporte
- [ ] Colocar no rodapé da landing e nas duas páginas legais

### O webhook nunca recebeu um evento real

O endereço está no ar e recusa corretamente quem não tem o segredo (HTTP 401),
mas o ledger `pagamentos` está **vazio**: nenhum evento verdadeiro da Cakto
passou por ele.

- [ ] Conferir na Cakto que o webhook aponta para
      `https://nexo-study-app-449.netlify.app/api/cakto/webhook` com os 10
      eventos marcados. **Não criar um segundo** — geraria um segredo novo e
      quebraria o que está no Netlify
- [ ] Disparar o evento de teste pelo painel
- [ ] **Confirmar que o webhook dispara junto com o modo de entrega
      "Acesso por e-mail"** configurado em 01/09. É a única incógnita real
- [ ] Compra de verdade ponta a ponta, com reembolso depois

### Revisão jurídica

- [ ] `/privacidade` e `/termos` refletem o que o sistema faz, mas não são
      parecer de advogado — e o público inclui **menores de idade**, que é onde
      a LGPD aperta

### Rotacionar credenciais (véspera do lançamento)

- [ ] Chave da conta de serviço do Firebase, chave do Gemini, `ADMIN_SECRET` e
      `CAKTO_WEBHOOK_SECRET`. **Revogar as antigas**, não só gerar novas

---

## 🟡 Qualidade e higiene

- [ ] **Imagem OG diz "Acesso de fundador · pré-lançamento"**
      (`opengraph-image.tsx:67`) — é o que aparece ao compartilhar o link no
      WhatsApp. Trocar antes de divulgar para qualquer pessoa
- [ ] **5 contas descartáveis no Auth** (de 17 no total):
      `testador1@example.com`, `testador2@example.com`,
      `teste-verificacao-claude@studyflow.com`, `yopan@gmail.com`,
      `henrique@gmail.com`.
      ⚠️ `testador1` é a conta do print do hero — só apagar depois de não
      precisar mais recapturar
- [ ] **7 documentos legados** `usuarios/{email}` ainda no Firestore. Já são
      inalcançáveis pela regra nova; apagar depois de confirmar que aqueles
      usuários acessam normalmente
      (backup em `../backup-usuarios-legado-2026-09-01.json`, fora do repo)
- [ ] **`public/logo.png`** tem o wordmark "Study Flow" embutido. Nenhum
      componente usa, mas não serve para material de marketing
- [ ] **Trocar a senha da conta admin** (foi digitada num chat)
- [ ] **Arrastar e soltar do Kanban** no desktop — nunca testado
- [ ] **`.gitattributes`** para normalizar fim de linha entre as duas máquinas.
      Já causou problema real: edições por script com `\n` não casam com
      arquivos em CRLF e falham em silêncio
- [ ] **Avisar a testadora** do endereço novo — o antigo responde 404

---

## 🟢 Decisões em aberto

- **Trial de fundador:** ainda ativo, com **6 e-mails** elegíveis na coleção
  `reservas`. Manter, encerrar ou virar cortesia?
- **Limitador de requisições:** adiado conscientemente — as rotas de IA já têm
  login + plano + cota mensal, e a única rota pública foi removida
- **Identidade visual do ecossistema Nexo (preto e branco):** adiada para
  depois do lançamento
- **Domínio próprio:** o `.netlify.app` é provisório
- **Renomear o repositório GitHub** para `nexo-study` — o GitHub redireciona,
  mas o Netlify precisa ser reconectado

---

## 💡 Ideias registradas, sem data

- Toggle **lista ↔ quadro** em Atividades e Trabalhos (hoje só quadro)
- **Anexos em PDF** no caderno (hoje só imagem; PDF exigiria Firebase Storage,
  que pede plano pago)
- **E-mail transacional próprio** (Resend) — deixou de ser urgente, já que a
  Cakto entrega o acesso por e-mail. Ainda útil para aviso de inadimplência
- **Firebase App Check**
- Notificações com o app fechado (FCM)

---

## ✅ Concluído

### 01/09/2026

- [x] **Deploy em produção** — `main` em `785c3e8`. Verificado por navegador
      automatizado: login funciona, as 10 telas carregam, **zero erros de
      JavaScript**, dashboard sem NaN
- [x] **Validação de segurança** — A1, A3, A4, A5, C1, C2, E1, E2, F1 passaram;
      A2, B2, C3, D1, D4 corrigidos. Detalhes no `CONTEXTO.md`
- [x] **A2** — a regra do Firestore aceitava e-mail não verificado como dono.
      7 usuários migrados, regra reduzida a `uid`, publicada. Ataque controlado
      devolve 403
- [x] **B2** — compra podia ser reivindicada por quem registrasse o e-mail
      primeiro. Agora exige e-mail confirmado, só quando há compra pendente
- [x] **LGPD** — `/privacidade`, `/termos`, exclusão de conta (testada com
      subcoleções de dois níveis) e aviso do Gemini
- [x] **Variáveis no Netlify** — 19 cadastradas, 5 órfãs da Kirvano removidas
- [x] **Entrega do acesso ao comprador** — resolvida sem código: a Cakto tem o
      modo "Acesso por e-mail", que manda o link no e-mail de Pagamento
      Confirmado
- [x] **Print do hero recapturado** — a captura revelou dois bugs reais, também
      corrigidos: o gráfico "Foco · últimos 7 dias" **nunca renderizou**
      (altura em porcentagem sobre pai sem altura) e o "Foco hoje" exibia
      "NaNh NaNmin"

### 31/08/2026

- [x] **Rebrand para Nexo Study** — código, metadados e prompt da IA
- [x] **Migração da Kirvano para a Cakto** — schema Zod do payload real, mapa
      explícito dos 16 eventos, idempotência por `data.id`, validação do
      `secret` com comparação de tempo constante
- [x] **Webhook falha FECHADO** — o da Kirvano aceitava qualquer origem quando
      a variável não estava configurada
- [x] **Plano vitalício** — compra única com acesso Pro permanente, por link
      avulso
- [x] **Site do Netlify renomeado** — `study-flow-app-449` → `nexo-study-app-449`
- [x] **Decisão da tipografia** — mantida a pilha do sistema; a Geist era
      baixada e nunca usada
- [x] **Modo Foco testado no celular** com a tela bloqueada
- [x] **`.env.local` reposto** após a formatação da máquina

### Antes

- [x] **`firestore.rules` publicadas** (20/08), conferidas contra a API do Google
- [x] **Checkout quebrado da Kirvano** — resolvido pela migração
