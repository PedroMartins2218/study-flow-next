# Retomar aqui

> **Leia este arquivo antes de qualquer outro.** Ele diz onde o trabalho parou.
> Última varredura completa: **01/09/2026, fim do dia**.
>
> Histórico por data fica no `CONTEXTO.md`. Este aqui é o "por onde continuar".

---

## O sistema está NO AR e funcionando

`main` em `6615ea2`, deploy do Netlify confirmado. Verificado por requisição
real e por navegador automatizado logando na produção:

| Verificação | Resultado |
|---|---|
| Login em produção | funciona |
| As 10 telas do app | todas carregam, títulos corretos |
| Erros de JavaScript | **nenhum** |
| Dashboard | sem NaN, gráfico com as 7 barras |
| Marca na landing | 44× "Nexo Study", 0× "Study Flow" |
| `/privacidade`, `/termos` | no ar |
| `/api/cakto/webhook` | existe; recusa sem segredo e com segredo errado (401) |
| `/api/reserva` (removida) | 404 |
| Regras do Firestore | publicadas |
| Variáveis no Netlify | 19 cadastradas |

---

## 🔴 Bloqueia vender para estranhos

### 1. Não existe e-mail de suporte — mas as páginas legais prometem um

**Achado na varredura de 01/09.** `/privacidade` e `/termos` mandam o usuário
escrever "para o e-mail de suporte informado no rodapé do site". Varri o
projeto inteiro: **não existe nenhum e-mail de contato em lugar nenhum.**

Quem quiser exercer os direitos da LGPD — acesso, correção, exclusão — não tem
para onde escrever. É promessa quebrada e exposição legal.

- [ ] Definir um endereço de suporte
- [ ] Colocar no rodapé da landing e nas duas páginas legais

### 2. O webhook nunca recebeu um evento real

O endereço está no ar e recusa corretamente quem não tem o segredo, mas nenhum
evento verdadeiro da Cakto passou por ele.

- [ ] Conferir na Cakto que o webhook aponta para
      `https://nexo-study-app-449.netlify.app/api/cakto/webhook` com os 10
      eventos marcados. **Não criar um segundo** — geraria um segredo novo e
      quebraria o que está no Netlify
- [ ] Disparar o evento de teste pelo painel
- [ ] **Confirmar que o webhook dispara junto com o modo de entrega
      "Acesso por e-mail"** que foi configurado. É a única incógnita real
- [ ] Compra de verdade, ponta a ponta, com reembolso depois

### 3. Revisão jurídica

Os textos de `/privacidade` e `/termos` refletem o que o sistema faz, mas não
são parecer de advogado — e o público inclui **menores de idade**, que é
justamente onde a LGPD aperta.

### 4. Rotacionar credenciais

Chave da conta de serviço do Firebase, chave do Gemini, `ADMIN_SECRET` e
`CAKTO_WEBHOOK_SECRET`. **Revogar as antigas**, não só gerar novas.

---

## 🟡 Qualidade e higiene

- [ ] **A imagem OG ainda diz "Acesso de fundador · pré-lançamento"**
      (`opengraph-image.tsx:67`). É o que aparece quando alguém compartilha o
      link no WhatsApp. Trocar pela copy dos planos
- [ ] **5 contas descartáveis no Auth**: `testador1@example.com`,
      `testador2@example.com`, `teste-verificacao-claude@studyflow.com`,
      `yopan@gmail.com`, `henrique@gmail.com`.
      ⚠️ `testador1` é a conta usada no print do hero — só apagar depois de
      não precisar mais recapturar
- [ ] **7 documentos legados** `usuarios/{email}` ainda no Firestore. Já são
      inalcançáveis pela regra nova; apagar depois de confirmar que aqueles
      usuários acessam normalmente
      (backup em `../backup-usuarios-legado-2026-09-01.json`, fora do repo)
- [ ] **`public/logo.png`** tem o wordmark "Study Flow" embutido. Nenhum
      componente usa, mas não serve para material de marketing
- [ ] **Trocar a senha da conta admin** (foi digitada num chat)
- [ ] **Arrastar e soltar do Kanban** no desktop — nunca testado
- [ ] **`.gitattributes`** para normalizar fim de linha entre as duas máquinas.
      Já causou problema real: edições por script com `\n` não casam com os
      arquivos em CRLF e falham em silêncio

---

## 🟢 Decisões em aberto

- **Trial de fundador:** ainda ativo, com **6 e-mails** elegíveis na coleção
  `reservas`. Manter, encerrar ou reaproveitar como cortesia?
- **Limitador de requisições:** adiado por decisão consciente — as rotas de IA
  já têm login + plano + cota mensal, e a única rota pública foi removida.
  Reavaliar quando houver volume
- **Identidade visual do ecossistema Nexo (preto e branco):** adiada para
  depois do lançamento
- **Domínio próprio:** o `.netlify.app` é provisório
- **Firebase App Check**, **e-mail transacional próprio (Resend)**,
  **anexos em PDF**, **toggle lista/quadro**, **notificações com app fechado**

---

## Contas de teste

| E-mail | Senha | Plano |
|---|---|---|
| `testador1@example.com` | `NexoTeste1#2026` | Pro até 30/09/2026 |
| `testador2@example.com` | `NexoTeste2#2026` | Pro até 30/09/2026 |

`testador1` tem dados de demonstração e é a conta do print do hero.

---

## Sugestão de ordem para amanhã

1. **E-mail de suporte** — é rápido e destrava a conformidade legal
2. **Teste do webhook** com a Cakto, de ponta a ponta
3. **Copy da imagem OG** — antes de divulgar o link para qualquer pessoa
4. **Avisar a testadora** do endereço novo (o antigo responde 404)
5. Depois: limpeza das contas de teste e dos documentos legados
