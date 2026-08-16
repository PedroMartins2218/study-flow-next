# Study Flow — marca e identidade visual

> Documento de referência para marketing, copy e design.
> Tudo aqui foi extraído do produto real (código, telas e decisões registradas),
> não de suposição. Onde falta informação, está marcado como **[preencher]**.

---

## 1. O que é o Study Flow

**O painel operacional do estudante.**

SaaS brasileiro de organização de estudos. Reúne num só lugar o que hoje vive
espalhado: matérias, atividades, trabalhos, provas, caderno de anotações e
sessões de foco — com gráficos de evolução e um Agente de IA que conversa,
explica matéria e agenda os prazos que você contar a ele.

**Para quem:** estudantes de ensino médio, vestibulandos, concurseiros e
universitários.

**O que NÃO é:** não é cursinho, não vende aulas nem conteúdo. É a ferramenta que
organiza o material que a pessoa já estuda.

---

## 2. A promessa (e o limite dela)

> **Estrutura, clareza e constância.**

Esta é a promessa central, e ela tem um limite deliberado:

### ⛔ O Study Flow nunca promete aprovação

Regra registrada desde o início do projeto e visível no rodapé do site:
*"O Study Flow não promete aprovação; ele te dá estrutura, clareza e constância."*

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

**Situação atual:** o produto **carrega a fonte Geist mas renderiza em Arial** —
o `globals.css` declara Arial no `body` e sobrepõe a fonte carregada. Verificado
no navegador: títulos, parágrafos e botões saem todos em Arial.

👉 **Decisão pendente** antes de produzir qualquer material de marca. Ver
`docs/PENDENCIAS.md`. Não faz sentido fechar um manual tipográfico enquanto o
produto não decidir qual fonte usa.

### Logo

- `public/logo-mark.png` — monograma, usado sozinho no app
- `public/logo.png` — logo completa (monograma + "Study Flow"), para usos maiores
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

Pagamento pela **Kirvano**. O Study Flow não coleta nem armazena dados de
pagamento — e isso é dito na FAQ, porque é diferencial de confiança.

---

## 7. O que ainda falta para o marketing — **[preencher]**

Estas informações não existem em lugar nenhum do projeto e só o Pedro tem:

- [ ] **A história de origem.** Por que o Study Flow foi criado? Que problema
      pessoal do Pedro deu origem a ele? É o material mais valioso para redes
      sociais e página de vendas, e não dá para inventar.
- [ ] **Público prioritário.** Vestibulando, concurseiro ou universitário? O
      produto atende os três, mas a comunicação rende mais escolhendo um.
- [ ] **Canais de aquisição.** Instagram, TikTok, tráfego pago, indicação?
- [ ] **Primeiros depoimentos reais**, com autorização de uso.

---

## 8. Referências rápidas

- **Produção:** https://study-flow-app-449.netlify.app
- **Print do produto:** `public/marketing/dashboard-preview.png`
- **Estado técnico:** `CONTEXTO.md` e `docs/ESTADO-DO-PROJETO.md`
