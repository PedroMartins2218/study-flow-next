# Nexo Study — marca e identidade visual

> Documento de referência para marketing, copy e design.
> Tudo aqui foi extraído do produto real (código, telas e decisões registradas),
> não de suposição. Onde falta informação, está marcado como **[preencher]**.

---

## 1. O que é o Nexo Study

**O painel operacional do estudante.**

SaaS brasileiro de organização de estudos. Reúne num só lugar o que hoje vive
espalhado: matérias, atividades, trabalhos, provas, caderno de anotações e
sessões de foco — com gráficos de evolução e um Agente de IA que conversa,
explica matéria e agenda os prazos que você contar a ele.

**Para quem:** estudantes de ensino médio, vestibulandos, concurseiros e
universitários.

**O que NÃO é:** não é cursinho, não vende aulas nem conteúdo. É a ferramenta que
organiza o material que a pessoa já estuda.

### O nome: de Study Flow a Nexo Study (31/08/2026)

O produto se chamou **Study Flow** do início até 31/08/2026. A troca veio de uma
oportunidade: o projeto foi **selecionado para a PGTEC**, feira de tecnologia
sustentável de Praia Grande. No contexto da feira ele não pode ser anunciado como
produto pago — e pausar a monetização de um sistema pronto não fazia sentido.

**Nexo Study** resolve os dois lados: libera a venda em paralelo à feira e liga o
produto ao futuro **ecossistema Nexo**, a marca-guarda-chuva do fundador.

**A identidade visual não mudou** — mesmas cores, mesmo layout, mesmo monograma
**"ST"**, que segue servindo para Nexo **ST**udy.

Ao escrever copy: use **Nexo Study** por extenso. "Nexo" sozinho refere-se ao
ecossistema, não ao produto de estudos.

---

## 2. A promessa (e o limite dela)

> **Estrutura, clareza e constância.**

Esta é a promessa central, e ela tem um limite deliberado:

### ⛔ O Nexo Study nunca promete aprovação

Regra registrada desde o início do projeto e visível no rodapé do site:
*"O Nexo Study não promete aprovação; ele te dá estrutura, clareza e constância."*

Isso não é modéstia de marketing — é honestidade sobre o que uma ferramenta de
organização pode entregar. Copy que prometa passar em prova, concurso ou
vestibular **está proibida**.

### ⛔ Depoimentos fictícios são proibidos

A seção "para quem é" do site usa **cenários de uso**, não pessoas inventadas.
Enquanto não houver depoimento real e autorizado, não se inventa um.

---

## 3. O problema que o produto ataca

Os três atritos que a landing nomeia — e que a copy deve continuar usando:

| Dor | Como aparece na vida do estudante |
|---|---|
| **Informação espalhada** | Prazo no grupo do WhatsApp, matéria no caderno, prova na agenda do celular. Nada conversa entre si. |
| **Sem visão de progresso** | Difícil saber se está evoluindo de verdade ou girando em torno das mesmas matérias. |
| **Foco que não rende** | Senta para estudar, mas sem ciclo, sem meta e sem registro, o tempo passa e falta a sensação de progresso. |

A frase-síntese do site: **"Estudar sem organização cansa o dobro."**
Não é falta de esforço — é falta de estrutura.

---

## 4. Tom de voz

- **Direto e sem enrolação.** Frases curtas. Nada de jargão corporativo.
- **Encorajador, não professoral.** Fala com o estudante, não para ele.
- **Português do Brasil, informal mas correto.** "Bora", "beleza" cabem no
  Agente de IA; no site, um pouco mais contido.
- **Concreto acima de genérico.** "Menos de R$ 1 por dia" vale mais que
  "preço acessível".
- **Honesto sobre limites.** Se a IA pode errar, o produto avisa: *"O agente
  pode errar. Confira datas e informações importantes."*

Estas mesmas regras estão codificadas no prompt do Agente de IA, então o produto
fala como a marca fala.

---

## 5. Identidade visual

### Cor

O azul é a marca. Tudo o mais é neutro ou semântico.

| Uso | Hex | Onde |
|---|---|---|
| **Azul principal** | `#2563EB` | botões, links, anel do foco, destaques |
| Azul hover | `#1D4ED8` | estado de hover dos botões |
| **Azul da marca** | `#0547E6` | logo e materiais de marca |
| Azul claro (fundo) | `#EFF6FF` | chips e áreas de destaque suave |
| Tinta (texto forte) | `#0F172A` | títulos |
| Texto secundário | `#475569` / `#64748B` | parágrafos e apoios |
| Bordas e trilhos | `#E2E8F0` | divisórias, anel vazio |
| Fundo do app | `#F8FAFC` | plano de fundo geral |

**Cor semântica** (não conta como cor de marca): verde `emerald` para sucesso e
descanso, âmbar para alerta, vermelho para atraso e perigo.

**Cor por área do produto** — cada seção tem sua cor de ícone, o que ajuda a
pessoa a se localizar:

| Área | Cor |
|---|---|
| Matérias | azul |
| Atividades | violeta |
| Trabalhos | âmbar |
| Provas | vermelho |
| Foco | verde |
| Caderno | índigo |

### Tema escuro

O produto tem tema claro e escuro. O escuro usa `#0F172A` como fundo e `#1E293B`
como superfície dos cards. A barra lateral é escura **nos dois temas** — é a
assinatura visual do painel.

⚠️ **Armadilha para quem for mexer no CSS:** o tema escuro sobrescreve classes
pelo **nome exato**. `bg-slate-50` tem regra; `bg-slate-50/60` (com opacidade)
**não tem** e fica clara no escuro. Isso já quebrou a legibilidade de duas telas.

### Formas

- **Cantos generosos:** `16px` é o raio padrão dos cards (`rounded-2xl`).
- **Sombra sutil**, nunca pesada. Elevação vem de sombra + anel de 1px, não de borda dura.
- **Ícones de traço** (stroke), nunca preenchidos, espessura 1.6–1.8.

### Tipografia

**Decidido em 31/08/2026: a pilha do sistema (Arial/Helvetica).**

Durante meses o produto carregava a fonte Geist mas renderizava em Arial — o
`globals.css` declara Arial no `body` e sobrepunha a fonte baixada. Confirmado
que `font-sans` e `font-mono` não eram usados por nenhum componente: a Geist era
peso morto. O carregamento foi removido, economizando duas requisições ao Google
Fonts **sem mudar um pixel**.

👉 Para material de marca, use **Arial** (ou Helvetica). É a fonte real do
produto — peça de marketing em outra fonte não vai casar com as telas.

### Logo

- `public/logo-mark.png` — monograma "ST", usado sozinho no app. **Continua
  válido após o rebrand**
- ⚠️ `public/logo.png` — logo completa, mas com o wordmark **"Study Flow"**
  embutido. **Está desatualizada** e precisa ser redesenhada. Nenhum componente
  a usa hoje, então não aparece no produto — mas não use em material de marketing
- ⚠️ `public/marketing/dashboard-preview.png` — o print do produto ainda mostra
  "Study Flow" na sidebar. **Precisa ser recapturado antes de qualquer peça**
- Em fundo escuro, o monograma vai **dentro de um chip branco** para garantir contraste
- O wordmark é `font-bold` com `tracking-tight`

---

## 6. Planos

| Plano | Preço | O que entrega |
|---|---|---|
| **Base** | R$ 29,90/mês | Todas as ferramentas de organização |
| **Pro** | R$ 49,90/mês | Tudo do Base + Agente de IA |

Argumentos de venda usados: sem fidelidade, cancela quando quiser, acesso pelo
navegador sem instalar nada, e o comparativo por dia ("menos de R$ 1 por dia").

Pagamento pela **Cakto**. O Nexo Study não coleta nem armazena dados de
pagamento — e isso é dito na FAQ, porque é diferencial de confiança.

---

## 7. O que ainda falta para o marketing — **[preencher]**

Estas informações não existem em lugar nenhum do projeto e só o Pedro tem:

- [ ] **A história de origem.** Por que o Nexo Study foi criado? Que problema
      pessoal do Pedro deu origem a ele? É o material mais valioso para redes
      sociais e página de vendas, e não dá para inventar.
- [ ] **Público prioritário.** Vestibulando, concurseiro ou universitário? O
      produto atende os três, mas a comunicação rende mais escolhendo um.
- [ ] **Canais de aquisição.** Instagram, TikTok, tráfego pago, indicação?
- [ ] **Primeiros depoimentos reais**, com autorização de uso.

---

## 8. Referências rápidas

- **Produção:** https://nexo-study-app-449.netlify.app
- **Print do produto:** `public/marketing/dashboard-preview.png`
- **Estado técnico:** `CONTEXTO.md` e `docs/ESTADO-DO-PROJETO.md`
