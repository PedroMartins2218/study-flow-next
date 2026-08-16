# Study Flow — o que ainda falta

> Situação em **08/08/2026**. Documento de trabalho: risque o que concluir.

---

## 🔴 Bloqueado por terceiros

### Checkout da Kirvano abre em branco
Os dois links respondem HTTP 200, mas o **JavaScript da própria Kirvano** quebra
antes de desenhar a tela:

```
Error during hydration for route /$offerUuid
TypeError: Cannot read properties of undefined (reading 'name')
  em pay.kirvano.com/assets/index-DKbiOUEa.js
```

Acontece nas **duas ofertas do mesmo produto**, em navegador limpo — logo é
configuração do produto, não da oferta. O erro lê um campo `.name`, o que combina
com **"nome do vendedor"** em branco no cadastro.

- [ ] Conferir campos obrigatórios do produto (nome do vendedor, imagem, e-mail de suporte, página de vendas)
- [ ] Conferir se o produto está publicado, e não em rascunho
- [ ] Se persistir: abrir chamado citando o erro acima e o UUID `d495b817-0398-4bae-9274-c3b5af826253`

**Trava em cascata:** sem checkout não há compra de teste; sem compra de teste
não temos o JSON do webhook; sem ele não dá para preencher os IDs de oferta nem
confirmar qual cabeçalho carrega o token.

---

## 🟡 Pendências do Pedro (independem da Kirvano)

- [ ] **Publicar as regras do Firestore** — `firebase deploy --only firestore:rules`
      **Sem isso, anexos do caderno e conversas do chat não funcionam em produção.**
      A regra antiga cobria só um nível de subcoleção.
- [ ] **`ADMIN_SECRET`** ainda vazio (destrava o painel `/admin`)
- [ ] **Variáveis no Netlify** — `netlify env:set --force`, uma a uma
      (`env:import` corrompe aspas). ⚠️ `GEMINI_MODEL` mudou para
      `gemini-flash-lite-latest`; o valor antigo saiu do ar para contas novas.
- [ ] **Testar o Modo Foco no celular com a tela bloqueada** — é a única prova
      real da correção do cronômetro
- [ ] **Testar arrastar e soltar no Kanban** (desktop) — não deu para verificar
      por automação
- [ ] **Trocar a senha da conta admin** (foi digitada no chat)

---

## 🟢 Comigo, quando você quiser

- [ ] **Preparar o commit** — nada foi commitado ainda (~60 arquivos entre
      modificados e novos)
- [ ] **Decidir a tipografia** (ver abaixo)
- [ ] **Pasta órfã `kirvano-landing/`** com o preço antigo de R$ 19,90 — decisão sua

---

## ⚠️ Decisão de design em aberto: a fonte

O app **carrega a fonte Geist** (`layout.tsx`), mas o `globals.css` declara
`body { font-family: Arial, Helvetica, sans-serif; }` — que sobrepõe tudo.

Medido no navegador: `h1`, parágrafos e botões renderizam em **Arial**. A Geist
é baixada e nunca usada.

Três saídas, todas de uma linha:
1. **Usar a Geist** — remover a declaração de Arial. Muda o visual do produto inteiro.
2. **Assumir a Arial** — remover o carregamento da Geist e parar de baixar fonte à toa.
3. **Escolher outra fonte** de propósito.

Não mexi porque troca a cara de todas as telas — é decisão sua.

---

## 💡 Ideias registradas, sem data

- Toggle **lista ↔ quadro** nas telas de Atividades e Trabalhos (hoje só quadro)
- **Anexos em PDF** no caderno (hoje só imagem; PDF exigiria Firebase Storage, que pede plano pago)
- **E-mail transacional** (Resend): confirmação de compra e aviso de inadimplência
- **Rate limit** em `/api/reserva` e nas rotas de IA
- **Firebase App Check**
- Domínio próprio
- Notificações com o app fechado (FCM)
