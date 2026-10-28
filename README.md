# PitchFolio

**Portfólio estruturado pelo Método STAR e Pitch Deck executivo de 5 slides — prontos em minutos.**  
Desenvolvido para o **Hackathon Startups & Lovable (UNIFAL-MG · 2026)** — **Case 3: Empregabilidade e Carreira**.

---

## 1. O Problema

Estudantes universitários e profissionais em início de carreira acumulam projetos acadêmicos, iniciações científicas, freelas e repositórios no GitHub, mas falham na etapa de triagem porque:
1. **Currículos tradicionais são listas passivas** que não demonstram resolução de problemas na prática.
2. **Construir um portfólio do zero exige design e copywriting**, criando uma barreira para quem busca o primeiro estágio ou emprego.
3. **Entrevistas e dinâmicas exigem síntese visual**, mas candidatos raramente possuem uma apresentação estruturada da própria trajetória.

---

## 2. A Solução

O **PitchFolio** encurta a distância entre a sala de aula e a primeira vaga transformando experiências brutas (PDF do currículo, texto do LinkedIn, repositórios públicos do GitHub ou 3 perguntas guiadas) em **dois ativos sincronizados sob um único link público (`/p/:slug`)**:

1. **Dossiê Web pelo Método STAR**: Apresenta o projeto de maior impacto dividido em *Contexto & Desafio*, *Execução na Prática* e *Resultados & Impacto*, acompanhado de métricas, competências e linha do tempo da trajetória.
2. **Pitch Deck Interativo de 5 Slides**: Apresentação executiva pronta para entrevistas, feiras de recrutamento e compartilhamento com recrutadores, navegável por teclado (`←` `→`), toque, modo tela cheia (`F`) ou exportação direta para PDF.

| Slide | Título | Pilar de Empregabilidade |
| :--- | :--- | :--- |
| **01 / 05** | Quem sou eu | Posicionamento profissional e área de atuação |
| **02 / 05** | O que fiz na prática | Demonstração de potencial pelo Método STAR |
| **03 / 05** | Habilidades | Competências técnicas e interpessoais |
| **04 / 05** | Destaques & Trajetória | Métricas de impacto e evolução comprovada |
| **05 / 05** | Objetivo & Contato | Próximo passo de carreira e canais diretos |

---

## 3. Principais Funcionalidades

- **Ingestão Multi-Canal (Caminho A & Caminho B)**:
  - **Upload de Currículo (PDF até 5 MB)**: Extração estruturada via Lovable AI Gateway (`openai/gpt-6-astra` com validação estrita de JSON Schema).
  - **Sincronização com GitHub API + LinkedIn**: Busca automática de perfil, linguagens dominantes e repositórios de maior destaque na API pública do GitHub, combinada à colagem de texto do LinkedIn.
  - **Fluxo Guiado em 3 Passos**: Questionário rápido para candidatos que ainda não possuem currículo formatado.
- **IA com Trava de Evidência Fact-Safe (`groundedPortfolio`)**:
  - Reescreve as experiências com verbos de ação e clareza executiva, mas **rejeita automaticamente números ou empresas inventadas** que não constem nos dados originais do candidato, garantindo integridade factual.
- **Editor Split-View em Tempo Real**:
  - Edição lado a lado com alternância instantânea entre **Site do Portfólio** e **Pitch Deck (5 Slides)** e 3 temas editoriais (**Moderno**, **Quente** e **Minimal**).
- **Publicação Atômica e Compartilhamento**:
  - Persistência inicial em `localStorage` (sem fricção de cadastro para testar) e publicação autenticada via transação PostgreSQL RPC (`publish_pitchfolio_draft`) com Row-Level Security (RLS).
  - Geração de link público (`/p/:slug`), **Cartão de Pitch Digital com QR Code**, compartilhamento para WhatsApp/LinkedIn e exportação nativa para PDF.

---

## 4. Modelo de Negócio (B2B2C)

- **B2C Freemium (Estudantes e Candidatos)**: Criação gratuita do dossiê STAR, Pitch Deck de 5 slides, importação via GitHub/PDF e link público compartilhável.
- **B2B Institucional (Universidades, Bootcamps e Centros de Carreira)**: Licenciamento SaaS para instituições de ensino acompanharem métricas de empregabilidade por curso, padronizarem a vitrine de alunos formandos em feiras de carreira e conectarem talentos a empresas parceiras.

---

## 5. Arquitetura e Stack Tecnológica

- **Frontend & SSR**: React 19, TypeScript 5.8, TanStack Start & TanStack Router (`createFileRoute`, `createServerFn`), Tailwind CSS v4, Radix UI / shadcn/ui, Lucide Icons.
- **Backend & Banco de Dados**: Lovable Cloud / Supabase (PostgreSQL, Auth, Storage RLS, funções RPC transacionais e controle durável de orçamento de IA/uploads por hora).
- **Inteligência Artificial**: Lovable AI Gateway (`openai/gpt-6-astra`) com saída estruturada (`json_schema`), streaming SSE e fallback determinístico local (`localStructure`).
- **Qualidade & Testes**: Validação ponta a ponta com Zod (`src/validators/`) e suíte de testes automatizados com Vitest (`src/test/`).

```text
src/
├── components/pf/     # Componentes editoriais: PortfolioSite, PitchDeck, PublishDialogs, Logo
├── controllers/       # Server functions autenticadas e públicas (portfolios, uploads, curation)
├── services/          # Regras de negócio, IA fact-safe, GitHub/LinkedIn e publicação transacional
├── validators/        # Schemas Zod compartilhados entre cliente e servidor
├── routes/            # Rotas SSR: / (Landing), /criar (Ingestão), /editor, /p/$slug (Público)
└── test/              # Testes unitários e de integração (Vitest)
```

---

## 6. Executando Localmente

Pré-requisitos: Node.js 20+ e npm.

```sh
git clone git@github.com:Galmreis/pitchfolio-project.git
cd pitchfolio-project
npm install
npm run dev
```

Para rodar a verificação de tipos, testes automatizados e build de produção:

```sh
npx tsc --noEmit
npm test
npm run build
```
