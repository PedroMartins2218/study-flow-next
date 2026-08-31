# Nexo Study — o que ainda falta

> Situação em **31/08/2026**. Documento de trabalho: risque o que concluir.
> O produto se chamava **Study Flow** até 31/08/2026 — ver `CONTEXTO.md`.

---

## 🔴 Decisão em aberto: gateway de pagamento

O checkout da Kirvano **nunca funcionou**. Os dois links respondem HTTP 200, mas
o JavaScript da própria Kirvano quebra antes de desenhar a tela:

```
Error during hydration for route /$offerUuid
TypeError: Cannot read properties of undefined (reading 'name')
  em pay.kirvano.com/assets/index-DKbiOUEa.js
```

Acontece nas **duas ofertas do mesmo produto**, em navegador limpo — logo é
configuração do produto, não da oferta. O erro lê um campo `.name`, o que combina
com **"nome do vendedor"** em branco no cadastro.

**Está em avaliação trocar a Kirvano pela Cacto** (decisão prevista para
31/08/2026). O custo da troca é contido: a lógica de idempotência, a máquina de
estados e as regras de acesso em `assinaturaCore.ts` são agnósticas ao gateway.
Muda o schema Zod do payload em `kirvanoWebhook.ts`, a validação de token e os
nomes das envs.

- [ ] **Decidir: continuar na Kirvano ou migrar para a Cacto**
- [ ] Se ficar na Kirvano: conferir campos obrigatórios do produto (nome do
      vendedor, imagem, e-mail de suporte, página de vendas) e se ele está
      publicado, não em rascunho. Persistindo, abrir chamado citando o erro
      acima e o UUID `d495b817-0398-4bae-9274-c3b5af826253`
- [ ] Preencher `KIRVANO_OFERTA_BASE_ID` e `KIRVANO_OFERTA_PRO_ID` — só saem do
      payload de uma compra real (as 2 envs que faltam no Netlify)
- [ ] Testar a compra ponta a ponta: checkout → `/obrigado` → cadastro com o
      mesmo e-mail → acesso liberado sozinho. Testar reentrega (não pode
      duplicar) e chargeback

**Trava em cascata:** sem checkout não há compra de teste; sem compra de teste
não temos o JSON do webhook; sem ele não dá para preencher os IDs de oferta nem
confirmar qual cabeçalho carrega o token.

---

## 🔴 Segurança: o webhook falha ABERTO

`kirvanoWebhook.ts:266` devolve `true` quando o token não está configurado — o
endpoint aceita qualquer origem. A variável já está no Netlify, então não há
risco agora, mas isso é uma trava frágil.

- [ ] **Apertar para falhar FECHADO** (`return false` sem token configurado)
      assim que chegar o primeiro evento real. Vale para a Cacto também, se a
      migração acontecer

---

## 🟡 Pendências do Pedro

- [ ] **Recapturar `public/marketing/dashboard-preview.png`** — o print do hero
      da landing mostra "Study Flow" na sidebar. Rodar local, logar, capturar de
      novo. Aproveitar para recortar o nome do usuário, que aparece no print
      atual
- [ ] **Redesenhar `public/logo.png`** — tem o wordmark antigo embutido. Sem
      urgência: nenhum componente usa esse arquivo (só o `logo-mark.png`, que é
      só o monograma "ST" e continua válido)
- [ ] **Testar arrastar e soltar no Kanban** (desktop) — não dá para verificar
      por automação
- [ ] **Trocar a senha da conta admin** (foi digitada num chat)

---

## ✅ Concluído desde 08/08/2026

- [x] **Rebrand para Nexo Study** (31/08) — código, metadados e prompt da IA
- [x] **Site do Netlify renomeado** (31/08) — `study-flow-app-449` →
      `nexo-study-app-449`. Confirmado: a nova URL responde 200 e a antiga, 404
- [x] **Publicadas as `firestore.rules`** (20/08) — conferido contra a API de
      Rules do Google: o ruleset em produção é idêntico ao arquivo local
- [x] **`ADMIN_SECRET` preenchido** (20/08) — `/admin` destravado
- [x] **16 das 18 variáveis no Netlify** (20/08) — faltam só as duas
      `KIRVANO_OFERTA_*`, presas no checkout
- [x] **`GEMINI_MODEL` validado** contra a API — `gemini-flash-lite-latest`
      está entre os 50 modelos visíveis à chave
- [x] **Modo Foco testado no celular com a tela bloqueada** (31/08) — o
      cronômetro roda corretamente. Era a única prova real da reescrita que
      trocou a soma de tiques por `fimEm` + `Date.now()`
- [x] **Decisão da tipografia encerrada** (31/08) — mantida a pilha do sistema
      (Arial). A Geist era baixada e nunca usada; o carregamento foi removido,
      economizando duas requisições ao Google Fonts sem mudar um pixel
- [x] **Pasta órfã `kirvano-landing/`** — não existe mais
- [x] **`.env.local` reposto** (31/08) após a formatação da máquina, com o
      Firebase Admin e o Gemini validados por conexão real

---

## 💡 Ideias registradas, sem data

- Toggle **lista ↔ quadro** nas telas de Atividades e Trabalhos (hoje só quadro)
- **Anexos em PDF** no caderno (hoje só imagem; PDF exigiria Firebase Storage,
  que pede plano pago)
- **E-mail transacional** (Resend): confirmação de compra e aviso de inadimplência
- **Rate limit** em `/api/reserva` e nas rotas de IA
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
