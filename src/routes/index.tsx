import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Globe, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/pf/Logo";
import { PitchDeck } from "@/components/pf/PitchDeck";
import { PortfolioSite } from "@/components/pf/PortfolioSite";
import { DEMO_ANSWERS, THEMES, localStructure, type ThemeName } from "@/lib/portfolio";
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
  projectTitle: "UniRota · App de Caronas Universitárias",
  metrics: ["1.200 viagens", "4 meses", "-30% custo"],
  avatarUrl: "/visuals/avatar-ana.svg",
  projectImageUrl: "/visuals/project-caronas.svg",
};
const DEMO_DECK = createDeck(DEMO_PORTFOLIO);

function Index() {
  const [demoView, setDemoView] = useState<"deck" | "site">("deck");
  const [demoTheme, setDemoTheme] = useState<ThemeName>("moderno");

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/editor">Meu portfólio</Link></Button>
          <Button asChild><Link to="/criar">Começar</Link></Button>
        </div>
      </header>

      {/* Focused Editorial Hero (No competing H2s or controls) */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-8 lg:pt-14">
        <div className="max-w-3xl">
          <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Empregabilidade & 1ª Oportunidade
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl">
            Transforme trabalhos, projetos e experiências em um <span className="text-primary">pitch de 5 slides</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Quem busca o primeiro emprego trava na página em branco. O PitchFolio lê seu currículo em PDF, seu perfil do LinkedIn ou suas respostas guiadas e estrutura sua apresentação pelo Método STAR pronta para entrevistas.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-11 rounded-lg px-6 text-sm font-semibold">
              <Link to="/criar">Montar meu pitch agora <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 rounded-lg px-5 text-sm font-medium">
              <Link to="/p/$slug" params={{ slug: "ana-souza-demo" }}>
                Ver dossiê publicado <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              Sem cadastro prévio · Importação de Currículo em PDF
            </span>
          </div>
        </div>

        {/* Dedicated Dual Product Showcase Stage Directly Below Hero */}
        <div className="mt-12 rounded-xl border border-border bg-card p-4 shadow-md sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
            <div className="inline-flex rounded-lg border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setDemoView("deck")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  demoView === "deck" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Presentation className="h-3.5 w-3.5" /> Pitch Deck (5 Slides)
              </button>
              <button
                type="button"
                onClick={() => setDemoView("site")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  demoView === "site" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="h-3.5 w-3.5" /> Dossiê Web Completo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDemoTheme(t.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      demoTheme === t.id ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label} · {t.layoutLabel}
                  </button>
                ))}
              </div>
              <Link to="/p/$slug" params={{ slug: "ana-souza-demo" }} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Abrir página pública <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {demoView === "deck" ? (
            <PitchDeck p={DEMO_PORTFOLIO} deck={DEMO_DECK} theme={demoTheme} />
          ) : (
            <div className="max-h-[540px] overflow-y-auto rounded-lg border border-border">
              <PortfolioSite p={DEMO_PORTFOLIO} theme={demoTheme} />
            </div>
          )}
        </div>
      </section>

      {/* Asymmetric 1/3 + 2/3 Editorial Ledger (replaces symmetrical 3-card feature row) */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.35fr] lg:gap-16">
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Como funciona</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Três etapas para sair do currículo genérico.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Em vez de exigir que você saiba redigir um currículo corporativo do zero, traduzimos trabalhos práticos, TCC, extensão, iniciação científica ou projetos em evidências claras.
              </p>
            </div>

            {/* Contextual Before -> After Visual Card */}
            <div className="rounded-xl border border-border bg-background p-4 shadow-xs space-y-3">
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Antes · Anotação solta ou trabalho da faculdade</span>
                <p className="mt-1 text-xs italic text-muted-foreground">
                  "Organizei um projeto de caronas na faculdade e bastante gente do campus começou a usar no dia a dia…"
                </p>
              </div>
              <div className="flex items-center justify-center text-xs font-bold text-primary">
                ↓ Estruturação pelo Método STAR
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Depois · Caso Executivo</span>
                  <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">-30% custo</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-foreground">
                  1.200 viagens combinadas em 4 meses com validação institucional.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border border-t border-border lg:border-t-0">
            {[
              {
                num: "01",
                tag: "Currículo PDF · Texto · Passo a Passo",
                t: "Coleta sem síndrome da página em branco",
                d: "Envie seu currículo em PDF, cole o texto do seu perfil ou use modelos de frases prontas para contar sua história em 3 passos simples.",
              },
              {
                num: "02",
                tag: "Método STAR · Fiel à sua história",
                t: "Estruturação executiva sem inventar dados",
                d: "A IA organiza sua experiência principal em Contexto, Ação na prática e Resultados mensuráveis — mantendo total fidelidade aos fatos que você informou.",
              },
              {
                num: "03",
                tag: "Link Público · QR Code · PDF",
                t: "Dois formatos prontos para o recrutador",
                d: "Com um clique, publique uma página web de leitura rápida e um Pitch Deck interativo de 5 slides (com modo tela cheia e impressão nativa em PDF).",
              },
            ].map(({ num, tag, t, d }) => (
              <div key={num} className="grid gap-3 py-6 first:pt-4 lg:first:pt-0 sm:grid-cols-[56px_1fr]">
                <span className="font-mono text-sm font-bold text-primary">{num}</span>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold">{t}</h3>
                    <span className="rounded bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                      {tag}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asymmetric B2B2C Split Block (replaces twin 2-column cards) */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="overflow-hidden rounded-xl border border-border bg-card lg:grid lg:grid-cols-[1.35fr_0.85fr]">
            <div className="p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Parcerias Institucionais</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Para Universidades, Escolas Técnicas e Feiras de Carreira
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Instituições de ensino superior e escolas técnicas utilizam o PitchFolio para padronizar a vitrine de alunos formandos, conectar turmas inteiras a empresas parceiras e acompanhar taxas de empregabilidade por curso.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-md border border-border bg-background px-3 py-1.5">Diretório de Talentos Verificados</span>
                <span className="rounded-md border border-border bg-background px-3 py-1.5">Catálogo QR para Feiras</span>
                <span className="rounded-md border border-border bg-background px-3 py-1.5">Indicadores por Turma</span>
              </div>

              {/* Contextual Institutional Directory Preview */}
              <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                {[
                  { img: "/visuals/avatar-ana.svg", name: "Ana Souza", course: "Eng. Software · 6º per.", metric: "1.200 viagens" },
                  { img: "/visuals/avatar-dev.svg", name: "Lucas Mendes", course: "Administração · 8º per.", metric: "-42% tempo" },
                  { img: "/visuals/avatar-design.svg", name: "Marina Costa", course: "Design & Comunicação · 7º per.", metric: "94% aprovação" },
                ].map((st) => (
                  <div key={st.name} className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5">
                    <img src={st.img} alt={st.name} className="h-9 w-9 shrink-0 rounded-lg border border-border object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">{st.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{st.course}</p>
                      <span className="mt-0.5 inline-block rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-primary">
                        {st.metric}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between border-t border-border bg-secondary/45 p-7 sm:p-10 lg:border-l lg:border-t-0">
              <div>
                <span className="inline-block rounded bg-primary px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                  100% Gratuito para Candidatos
                </span>
                <h3 className="mt-3 font-display text-xl font-bold">Para Estudantes e Candidatos</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Quem está buscando estágio ou primeiro emprego nunca paga para criar, editar, exportar em PDF ou publicar seu link público.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/80">
                <Link to="/criar" className="inline-flex items-center font-display text-sm font-bold text-primary hover:underline">
                  Criar meu portfólio gratuito <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
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
