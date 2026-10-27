import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Presentation, LayoutTemplate, Share2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/pf/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PitchFolio — Portfólio e pitch profissional em 10 minutos" },
      { name: "description", content: "Responda 3 perguntas e ganhe um portfólio web e um pitch deck de 5 slides com IA. Feito para estudantes e quem busca emprego." },
      { property: "og:title", content: "PitchFolio — Portfólio e pitch em 10 minutos" },
      { property: "og:description", content: "Case de projeto estruturado + pitch deck interativo de 5 slides, prontos para compartilhar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <Button asChild variant="ghost"><Link to="/criar">Começar</Link></Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
            <Sparkles className="h-4 w-4" /> Estruturado com IA
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
            Seu portfólio e pitch profissional prontos em <span className="text-primary">10 minutos</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            Recrutadores leem currículos em segundos. Destaque-se com um case de projeto estruturado e um pitch deck interativo de 5 slides — sem precisar de design.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-14 rounded-full px-8 text-base">
              <Link to="/criar">Criar meu portfólio <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
            <span className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> 3 passos · grátis</span>
          </div>
        </div>

        <div className="relative">
          <div className="theme-moderno rotate-[-2deg] rounded-3xl border border-border bg-pf-bg p-8 text-pf-fg shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pf-muted">Projeto Estrela · 3/5</p>
            <p className="mt-6 font-display text-3xl font-bold">App de caronas universitárias</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["+1.200 usuários", "-30% custo", "4 meses"].map((m) => (
                <span key={m} className="rounded-full bg-pf-accent px-3 py-1 text-sm font-semibold text-pf-accent-fg">{m}</span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
              {["Desafio", "Ação", "Resultado"].map((t) => (
                <div key={t} className="rounded-xl border border-pf-line bg-pf-card p-3">
                  <p className="font-semibold">{t}</p>
                  <div className="mt-2 h-1.5 w-full rounded bg-pf-line" />
                  <div className="mt-1.5 h-1.5 w-2/3 rounded bg-pf-line" />
                </div>
              ))}
            </div>
          </div>
          <div className="theme-quente absolute -bottom-8 -left-4 hidden rotate-[3deg] rounded-2xl border border-border bg-pf-bg px-5 py-4 text-pf-fg shadow-xl sm:block">
            <p className="font-display text-lg font-bold">Ana Souza</p>
            <p className="text-sm text-pf-muted">Engenharia de Software · UFPE</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {[
            { icon: LayoutTemplate, t: "Case estruturado", d: "Desafio, ação e resultado (método STAR) com métricas em destaque — o que recrutadores querem ver." },
            { icon: Presentation, t: "Pitch deck de 5 slides", d: "Apresentação interativa pronta para entrevistas, feiras e LinkedIn." },
            { icon: Share2, t: "Link público", d: "Publique e compartilhe no WhatsApp e LinkedIn com um clique." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t}>
              <Icon className="h-7 w-7 text-primary" />
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
        PitchFolio · Hackathon Startups & Lovable — Empregabilidade e Carreira
      </footer>
    </div>
  );
}
