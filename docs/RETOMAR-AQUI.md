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

### 1. Variáveis no Netlify

Apagar as 5 órfãs da Kirvano e cadastrar as 6 da Cakto.
Rode `npm run netlify-env` para os comandos já preenchidos, ou faça pelo painel.
⚠️ As duas `NEXT_PUBLIC_CAKTO_CHECKOUT_*` são embutidas no build — exigem
rebuild depois de cadastradas.

### 2. Entrega do acesso ao comprador — **decisão pendente**

O buraco mais importante que resta. Hoje o comprador paga, é levado a
`/obrigado` e instruído a criar conta com o mesmo e-mail. **Se fechar a aba, não
recebe nada** — nenhum e-mail nosso é enviado.

Investigar nesta ordem, parando no primeiro que resolver:
1. A Cakto redireciona para uma URL nossa? Apontar para
   `https://nexo-study-app-449.netlify.app/obrigado`. E ela passa o e-mail da
   compra na URL? Se passar, dá para pré-preencher o cadastro
2. A Cakto manda e-mail de confirmação e dá para personalizar? Se couber o link
   e a instrução do "use o mesmo e-mail", resolve sem código
3. Se não: e-mail próprio (Resend) disparado no `purchase_approved`

### 3. Recapturar o print do hero

`public/marketing/dashboard-preview.png` ainda mostra "Study Flow" na sidebar.
Rodar local, logar, capturar de novo, recortando o nome do usuário.

### 4. Merge na `main` e webhook

Uma única build do Netlify (⚠️ créditos acima de 75%). Depois do deploy,
cadastrar o webhook na Cakto apontando para `/api/cakto/webhook` e disparar um
evento de teste — antes do merge essa rota não existe.

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
