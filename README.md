# PitchFolio Project

Create a modern portfolio and career pitch deck generator for students and job seekers called "PitchFolio" (or Portfolio Maker) for the Hackathon Startups & Lovable (Case 3: Empregabilidade e Carreira).

Stack: React + Vite + TypeScript + Tailwind CSS with shadcn/ui and Lucide icons. Lovable Cloud for database, auth, and AI.

Core Requirements for this Day 2 MVP:
1. Landing Page:
   - Modern, inspiring hero: "Seu portfólio e pitch profissional prontos em 10 minutos".
   - Clear value proposition highlighting why candidates stand out with structured case studies and an interactive 5-slide pitch deck.
   - Primary CTA: "Criar meu portfólio" leading directly to the creation flow.

2. Guided Flow (Caminho Guiado):
   - Step 1: "Quem é você?" (Nome completo, área de atuação/curso, resumo de perfil ou bio inicial).
   - Step 2: "Seu projeto ou experiência de maior impacto" (Qual era o problema/desafio, o que você fez na prática, e quais foram os resultados ou aprendizados - método STAR simplificado).
   - Step 3: "Habilidades e Próximo Passo" (Top 3 a 5 habilidades técnicas e interpessoais, links como LinkedIn/GitHub, e objetivo profissional).

3. AI Generation & Preview Screen:
   - Simulated or integrated AI structuring that takes the answers and formats clean, professional copy with strong impact verbs.
   - Dual-view toggle:
     a) "Site do Portfólio": Clean web layout showing Hero, Bio, Destaque de Projeto com métricas/desafios, Habilidades, e Contato.
     b) "Pitch Deck (5 Slides)": Interactive slide presentation with previous/next controls and keyboard arrows (Slide 1: Quem sou eu, Slide 2: Habilidades, Slide 3: Projeto Estrela, Slide 4: Trajetória, Slide 5: Objetivo & Contato).
   - Theme switcher (Moderno, Quente, Minimal).
   - Form editor panel to tweak and edit any generated field directly (responsive: tabs on mobile, split-panel on desktop).

4. Save & Publish Flow:
   - Action to "Publicar portfólio" with account creation modal (E-mail e senha) using Lovable Cloud / Supabase auth, saving to database and generating a public shareable URL slug.
   - Share modal with quick buttons (Copiar link, Compartilhar no WhatsApp, Compartilhar no LinkedIn).

Keep the UI polished, clean, and in Portuguese (PT-BR) as requested in the hackathon wireframes.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a9ee1412-c563-496e-92f9-f7aee1b509b7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
