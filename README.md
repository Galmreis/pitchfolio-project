# PitchFolio 🎯

> **Portfólio estruturado pelo Método STAR e Pitch Deck executivo de 5 slides gerados em minutos.**  
> Projeto desenvolvido para o **Hackathon Startups & Lovable (UNIFAL-MG · 2026)**  
> **Case 3: Empregabilidade e Carreira** · Equipe **Los Penguinos**

[![React 19](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20%26%20Router-ff4154.svg)](https://tanstack.com/start)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.2-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase%20PostgreSQL%20RLS-3ecf8e.svg)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tests-28%20Passed-brightgreen.svg)](https://vitest.dev/)

---

## 1. O Problema

Estudantes universitários, formandos e profissionais em início de carreira enfrentam três barreiras críticas para ingressar no mercado:

1. **A armadilha da página em branco**: Quem busca o primeiro emprego trava ao tentar criar um portfólio do zero por não dominar design visual ou copywriting persuasivo.
2. **Currículos em PDF são listas passivas**: Recrutadores gastam em média 6 a 10 segundos por triagem e encontram listas de cargos sem contexto de execução ou resolução de problemas reais.
3. **Falta de síntese executiva para entrevistas**: Em dinâmicas, feiras de recrutamento ou conversas de networking, o candidato raramente dispõe de um material visual conciso para apresentar sua trajetória em menos de 3 minutos.

---

## 2. A Solução PitchFolio

O **PitchFolio** elimina a barreira de entrada transformando experiências brutas (PDF do currículo, texto do LinkedIn, repositórios públicos do GitHub ou um questionário guiado de 3 perguntas) em **dois produtos integrados e sincronizados sob um único link permanente (`/p/:slug`)**:

```
                       [ Input do Candidato ]
               (Currículo PDF / LinkedIn / GitHub / 3 Passos)
                                  │
                                  ▼
                     [ IA Fact-Safe Grounding ]
                 (Reescrita STAR com Verbos de Ação)
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
      [ 1. Dossiê Web STAR ]            [ 2. Pitch Deck 5 Slides ]
  • Caso em destaque (S-T-A-R)      • Slide 1: Quem sou eu (Identidade)
  • Métricas quantitativas          • Slide 2: Caso de maior impacto
  • Habilidades e marcos            • Slide 3: Competências centrais
  • Layouts: Bento, Split, Minimal  • Slide 4: Destaques e trajetória
  • Exportação para PDF             • Slide 5: Objetivo e contatos diretos
```

### Estrutura dos 5 Slides Executivos:

| Slide | Título | Pilar de Avaliação do Recrutador |
| :--- | :--- | :--- |
| **01 / 05** | **Quem sou eu** | Posicionamento profissional, área de atuação e biografia executiva. |
| **02 / 05** | **O que fiz na prática** | Aplicação do Método STAR (*Desafio*, *Ação* e *Resultado Mensurável*). |
| **03 / 05** | **Competências** | Habilidades técnicas e comportamentais prioritárias para a vaga. |
| **04 / 05** | **Impacto & Trajetória** | Métricas comprovadas, marcos da evolução e certificações. |
| **05 / 05** | **Próximo passo & Contato** | Objetivo claro de carreira e canais diretos (LinkedIn, GitHub, WhatsApp). |

---

## 3. Funcionalidades & Diferenciais do Edital

### 🤖 3.1. Simulador de Entrevista STAR com IA *(Ponto Extra do Case 3)*
- Integrado diretamente ao editor (`/editor`), a IA lê o projeto STAR estruturado do candidato e **gera 3 perguntas situacionais personalizadas de recrutador**.
- Cada pergunta inclui:
  - **Fase STAR avaliada** (Situação/Tarefa, Ação ou Resultado).
  - **Dica estratégica de recrutador** (o que o entrevistador realmente quer ouvir).
  - **Rascunho de resposta guiado** com estrutura recomendada para o candidato treinar antes da entrevista.
- Testado e coberto com 28 testes automatizados (`src/test/interview.test.ts`).

### 🏛️ 3.2. B2B Institucional & Catálogo QR para Feiras de Carreira (`/instituicoes`)
- **Vitrine Verificada de Talentos**: Diretório institucional para universidades, escolas técnicas e feiras de recrutamento exibirem seus alunos filtrados por área (*Tecnologia*, *Gestão & Negócios*, *Design & Comunicação*) e competências mapeadas.
- **Catálogo de Crachás QR**: Modo de exibição e impressão rápida de crachás/totens digitais com QR Code individual para leitura direta por câmeras de celular de recrutadores.

### 👤 3.3. Painel do Candidato & Sincronização Atômica (`/perfil`)
- Painel para gerenciamento de conta, canais de contato (WhatsApp, LinkedIn, GitHub, e-mail público) e portfólios publicados.
- **Sincronização em tempo real via PostgreSQL Trigger (`sync_profile_to_portfolio`)**: Edições no nome, telefone ou foto do candidato atualizam automaticamente todos os dossiês publicados e os slides 1 e 5 do pitch deck sem risco de inconsistência.

### 🛡️ 3.4. IA com Trava de Evidência Fact-Safe (`groundedPortfolio`)
- Reescreve as experiências do candidato com verbos de impacto e métricas claras, mas **rejeita alucinações de dados**: a IA não inventa números, empresas ou cursos que não constem no input original do aluno.
- Fallback determinístico local (`localStructure`) que garante funcionamento ininterrupto da aplicação mesmo em caso de falha de conexão com a API externa.

### 🎨 3.5. Três Estilos Editoriais Responsivos
- **Moderno (Bento)**: Blocos modulares com hierarquia visual contemporânea.
- **Quente (Split)**: Dossiê com barra lateral fixa de identidade e narrativa corrida.
- **Minimal (Índice)**: Estilo editorial suíço inspirado no Read.cv, com índice cronológico e métricas em ledger.
- Zero overflow em telas mobile (320px–375px), tablets e monitores widescreen.

### 🗺️ 3.6. Storyboard Interativo da Jornada (`/flow.html`)
- Mapa visual completo cobrindo **19 telas e estados reais da aplicação** lado a lado com **modo tela cheia interativo em 100% de resolução**.

---

## 4. Arquitetura do Repositório

O projeto segue a arquitetura moderna do **TanStack Start** (Full-Stack SSR) com tipagem estrita de ponta a ponta e separação limpa de responsabilidades:

```text
pitchfolio-project/
├── public/                     # Ativos estáticos e Storyboard completo (flow.html)
├── src/
│   ├── components/
│   │   ├── pf/                 # Componentes de domínio (PortfolioSite, PitchDeck, InterviewSimulator, PublishDialogs)
│   │   └── ui/                 # Primitivas acessíveis Radix UI / shadcn
│   ├── config/                 # Configurações de nuvem, limites e instâncias server-side
│   ├── controllers/            # Server functions tipadas (portfolios, uploads, profile, curation)
│   ├── hooks/                  # React Hooks personalizados (tema, responsividade, formulários)
│   ├── integrations/supabase/  # Cliente e tipos tipados do banco de dados relacional
│   ├── lib/                    # Utilitários, personas de demonstração, simulador STAR e storage
│   ├── middlewares/            # Verificação de tokens de autenticação Bearer
│   ├── routes/                 # File-based routing do TanStack Start
│   │   ├── index.tsx           # Landing Page institucional
│   │   ├── criar.tsx           # Fluxo de ingestão (PDF, LinkedIn, 3 passos)
│   │   ├── editor.tsx          # Editor split-view com simulador STAR e preview ao vivo
│   │   ├── instituicoes.tsx    # Portal B2B e Catálogo QR para feiras de carreiras
│   │   ├── perfil.tsx          # Painel do candidato e sincronização de contatos
│   │   ├── p.$slug.tsx         # Rota pública do dossiê e deck de 5 slides
│   │   └── api/                # Endpoints REST autenticados (/api/auth, /api/profile, etc.)
│   ├── services/               # Lógica de negócio (IA, GitHub API, LinkedIn parser, publicação)
│   ├── test/                   # Suíte de testes automatizados Vitest
│   ├── types/                  # Definições TypeScript (PitchFolio, Deck, STAR, Sections)
│   └── validators/             # Schemas Zod client-safe compartilhados
├── supabase/migrations/        # Migrações SQL versionadas (RLS, Triggers, RPC transacionais)
├── drizzle/                    # Esquema tipado Drizzle ORM
├── docker-compose.yml          # Orquestração de containers para deploy local
├── Dockerfile                  # Container otimizado multi-stage para produção
├── package.json                # Dependências e scripts do projeto
├── tsconfig.json               # Configuração do TypeScript 5.8
└── vite.config.ts              # Configuração do Vite com TanStack Start
```

---

## 5. Modelo de Dados & Segurança (PostgreSQL RLS)

- **Persistência Local-First**: O candidato cria e refina seu portfólio no `localStorage` sem precisar de cadastro prévio.
- **Transação Atômica (`publish_pitchfolio_draft`)**: A publicação grava o portfólio e gera o deck derivado de 5 slides em uma única transação SQL autenticada.
- **Row-Level Security (RLS)**:
  - Dossiês marcados como `is_published = true` são legíveis publicamente via `/p/:slug`.
  - Dossiês em rascunho e dados de contato privados são restritos exclusivamente ao proprietário (`auth.uid() = owner_id`).
  - Orçamento durável de IA e uploads (`ai_usage_budgets`) previne abusos de cota no backend.

---

## 6. Como Executar Localmente

### Pré-requisitos
- **Node.js**: versão 20 ou superior
- **npm** ou **bun**

### Instalação e Execução

```bash
# 1. Clonar o repositório
git clone git@github.com:Galmreis/pitchfolio-project.git
cd pitchfolio-project

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará acessível em `http://localhost:3000`.

### Verificação de Qualidade e Testes

```bash
# Executar a suíte de testes unitários e de integração (28 testes)
npm test

# Verificação estática de tipos TypeScript
npx tsc --noEmit

# Análise de linting
npm run lint

# Build de produção
npm run build
```

---

## 7. Equipe "Los Penguinos"

Desenvolvido com dedicação para o **Hackathon Startups & Lovable 2026**:

- **Fabine Regina Moura Dutra**
- **Gabriel do Vale Mendes**
- **Guilherme de Almeida Reis**

---

*PitchFolio — Transforme currículos estáticos em apresentações executivas de alto impacto.*