import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Presentation, LayoutTemplate, Share2, Clock, Github, FileText, Building2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/pf/Logo";
import { PitchDeck } from "@/components/pf/PitchDeck";
import { DEMO_ANSWERS, localStructure } from "@/lib/portfolio";
import { createDeck } from "@/validators/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PitchFolio — Portfólio e pitch profissional em 10 minutos" },
      { name: "description", content: "Transforme seu GitHub, LinkedIn ou currículo em um portfólio web e pitch deck de 5 slides com IA." },
      { property: "og:title", content: "PitchFolio — Portfólio e pitch em 10 minutos" },
      { property: "og:description", content: "Case de projeto estruturado + pitch deck interativo de 5 slides, prontos para compartilhar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DEMO_PORTFOLIO = {
  ...localStructure(DEMO_ANSWERS),
  projectTitle: "App de Caronas Universitárias",
  metrics: ["1.200 viagens", "4 meses", "-30% custo"],
};
const DEMO_DECK = createDeck(DEMO_PORTFOLIO);

function Index() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/editor">Meu portfólio</Link></Button>
          <Button asChild><Link to="/criar">Começar</Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1fr_1.15fr] lg:pt-14">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            01 · Dossiê STAR & Pitch Deck em 5 slides
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl">
            Sua trajetória traduzida em um <span className="font-serif-editorial italic font-normal">dossiê executivo</span> e pitch de 5 slides.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Recrutadores descartam currículos genéricos em segundos. Sincronize seu GitHub, envie seu PDF do LinkedIn ou responda 3 perguntas para estruturar um estudo de caso pelo Método STAR e uma apresentação navegável.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 rounded-lg px-6 text-sm font-medium">
              <Link to="/criar">Criar meu portfólio <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 rounded-lg px-5 text-sm font-medium">
              <Link to="/p/$slug" params={{ slug: "ana-souza-demo" }}>Ver exemplo público</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-border pt-5 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Github className="h-3.5 w-3.5 text-foreground" /> GitHub API</span>
            <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-foreground" /> PDF / LinkedIn</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-foreground" /> Sem cadastro prévio</span>
          </div>
        </div>

        {/* Live Interactive 5-Slide Deck right in the Hero */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>Prévia interativa · Ana Souza</span>
            <Link to="/p/$slug" params={{ slug: "ana-souza-demo" }} className="text-foreground underline underline-offset-4">
              Abrir dossiê completo
            </Link>
          </div>
          <PitchDeck p={DEMO_PORTFOLIO} deck={DEMO_DECK} theme="moderno" />
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
          {[
            { icon: LayoutTemplate, num: "01", t: "Dossiê pelo Método STAR", d: "A IA transforma atividades de faculdade, estágio ou GitHub em Contexto, Execução na prática e Resultados verificáveis." },
            { icon: Presentation, num: "02", t: "Pitch Deck de 5 slides", d: "Apresentação estruturada pronta para entrevistas técnicas, dinâmicas de grupo e feiras de recrutamento." },
            { icon: Share2, num: "03", t: "Link público e exportação PDF", d: "Publique seu link /p/seu-nome com QR Code ou exporte os 5 slides em PDF para anexar em processos seletivos." },
          ].map(({ icon: Icon, num, t, d }, idx) => (
            <div key={num} className={`space-y-3 ${idx > 0 ? "md:pl-8" : ""} ${idx < 2 ? "md:pr-8" : ""}`}>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-xs">{num}</span>
                <Icon className="h-4 w-4 text-foreground" />
              </div>
              <h2 className="font-display text-lg font-semibold">{t}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-xs text-muted-foreground">02 · Modelo de negócio B2B2C</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Gratuito para quem busca a primeira vaga. <span className="font-serif-editorial italic font-normal">Escalável</span> para quem forma talentos.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-7">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold">Estudantes e Candidatos</h3>
                  <p className="font-mono text-xs text-muted-foreground">B2C · Acesso gratuito (Freemium)</p>
                </div>
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Criação ilimitada de rascunhos, importação via GitHub e PDF do LinkedIn, estruturação com IA fact-safe, 3 temas editoriais e link público compartilhável.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-7">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold">Universidades, Bootcamps e HR Techs</h3>
                  <p className="font-mono text-xs text-muted-foreground">B2B · Licenciamento institucional (SaaS)</p>
                </div>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Diretório padronizado de alunos formandos para feiras de carreira, métricas agregadas de empregabilidade por curso e vitrine verificada de talentos para empresas parceiras.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <span>PitchFolio · Hackathon Startups & Lovable — Case 3: Empregabilidade e Carreira</span>
          <Link to="/criar" className="font-semibold text-foreground hover:underline">Começar agora →</Link>
        </div>
      </footer>
    </div>
  );
}
