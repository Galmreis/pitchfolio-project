import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Globe, Presentation, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/pf/Logo";
import { PitchDeck } from "@/components/pf/PitchDeck";
import { PortfolioSite } from "@/components/pf/PortfolioSite";
import { DEMO_PERSONAS, THEMES, buildPersonaPortfolio, type DemoPersona, type ThemeName } from "@/lib/portfolio";
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

const ROTATING_TARGETS = [
  "experiências acadêmicas",
  "iniciação científica",
  "trabalhos de TCC",
  "projetos práticos",
  "estágios e monitorias",
];

const AMBIENT_GLOW: Record<string, string> = {
  "ana-souza": "from-cyan-500/25 via-sky-500/15 to-indigo-500/20",
  "lucas-lima": "from-amber-500/25 via-orange-500/15 to-rose-500/20",
  "beatriz-rocha": "from-emerald-500/25 via-teal-500/15 to-cyan-500/20",
};

const SIMULATOR_EXAMPLES = [
  {
    id: "carona",
    tabLabel: "App de Carona",
    category: "Projeto de Graduação / Tecnologia",
    rawLabel: "Anotação informal de estudante",
    rawText:
      '"Organizei um projeto de caronas na faculdade com uns amigos porque o ônibus era caro e demorava. Muita gente do campus começou a usar no dia a dia…"',
    star: {
      situation: "Dificuldade de transporte e alto custo de deslocamento para alunos do campus.",
      action: "Desenvolveu app mobile com geolocalização e rotas com autenticação institucional.",
      result: "1.200 viagens combinadas em 4 meses e redução de 30% nos custos de deslocamento.",
      metric: "-30% custo · 1.2k viagens",
    },
  },
  {
    id: "pesquisa",
    tabLabel: "Iniciação Científica",
    category: "Pesquisa Acadêmica / IA",
    rawLabel: "Relatório bruto de laboratório",
    rawText:
      '"Fiz pesquisa voluntária no laboratório de IA limpando e organizando planilhas médicas que chegavam cheias de erro para os doutorandos analisarem…"',
    star: {
      situation: "Gargalo no pré-processamento manual de 5.000 prontuários médicos não padronizados.",
      action: "Criou pipeline automatizado em Python com detecção de anomalias e deduplicação.",
      result: "Tempo de limpeza reduzido de 14 dias para 3 horas, viabilizando artigo em congresso.",
      metric: "98% tempo poupado · 5k registros",
    },
  },
  {
    id: "consultoria",
    tabLabel: "Empresa Júnior",
    category: "Consultoria de Gestão",
    rawLabel: "Relato de experiência informal",
    rawText:
      '"Participei da empresa júnior ajudando um pequeno comércio perto da faculdade que estava com estoque descontrolado e perdendo mercadoria toda semana…"',
    star: {
      situation: "Perda semanal de 18% de insumos perecíveis por falta de controle de estoque.",
      action: "Mapeou fluxo de suprimentos, implementou curva ABC e treinou equipe em controle visual.",
      result: "Redução de 42% no desperdício no primeiro mês com payback do projeto em 3 semanas.",
      metric: "-42% desperdício · Payback 3 sem",
    },
  },
];

function Index() {
  const [persona, setPersona] = useState<DemoPersona>(DEMO_PERSONAS[0]!);
  const [demoView, setDemoView] = useState<"deck" | "site">("deck");
  const [demoTheme, setDemoTheme] = useState<ThemeName>("moderno");
  const [rotatingIdx, setRotatingIdx] = useState(0);
  const [simIdx, setSimIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const selectSimulatorExample = (idx: number) => {
    if (idx === simIdx) return;
    setIsScanning(true);
    setSimIdx(idx);
    setTimeout(() => setIsScanning(false), 400);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setRotatingIdx((prev) => (prev + 1) % ROTATING_TARGETS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const activePortfolio = buildPersonaPortfolio(persona);
  const activeDeck = createDeck(activePortfolio);

  const selectPersona = (next: DemoPersona) => {
    setPersona(next);
    setDemoTheme(next.theme);
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/instituicoes">Para Instituições</Link></Button>
          <Button asChild variant="ghost"><Link to="/perfil">Meu Perfil</Link></Button>
          <Button asChild variant="ghost"><Link to="/editor">Editor</Link></Button>
          <Button asChild><Link to="/criar">Começar</Link></Button>
        </div>
      </header>

      {/* Focused Editorial Hero (No competing H2s or controls) */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-8 lg:pt-14">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-xs text-primary animate-in fade-in duration-500">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Hackathon Startups & Lovable · Case 3: Empregabilidade e Carreira
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            Transforme{" "}
            <span
              key={rotatingIdx}
              className="inline-block text-primary animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              {ROTATING_TARGETS[rotatingIdx]}
            </span>{" "}
            em um pitch executivo de 5 slides.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
            Quem busca o primeiro emprego trava na página em branco. O PitchFolio lê seu currículo em PDF, seu perfil do LinkedIn ou suas respostas guiadas e estrutura sua apresentação pelo Método STAR pronta para entrevistas.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
            <Button asChild size="lg" className="h-11 rounded-lg px-6 text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-[0.98]">
              <Link to="/criar">Montar meu pitch agora <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 rounded-lg px-5 text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-[0.98]">
              <Link to="/p/$slug" params={{ slug: persona.slug }}>
                Ver dossiê publicado <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              Sem cadastro prévio · Importação de Currículo em PDF
            </span>
          </div>
        </div>

        {/* Dedicated Dual Product Showcase Stage Directly Below Hero */}
        <div className="relative mt-12">
          {/* Dynamic Ambient Aura matching selected persona */}
          <div
            className={`pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-tr ${
              AMBIENT_GLOW[persona.id] ?? "from-primary/20 via-primary/10 to-transparent"
            } blur-2xl opacity-60 transition-all duration-700`}
            aria-hidden="true"
          />

          <div id="vitrine-interativa" className="relative rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6 backdrop-blur-xs">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-semibold text-muted-foreground">Exemplos por área:</span>
                {DEMO_PERSONAS.map((dp) => {
                  const active = persona.id === dp.id;
                  return (
                    <button
                      key={dp.id}
                      type="button"
                      onClick={() => selectPersona(dp)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <img src={dp.avatarUrl} alt={dp.answers.name} className="h-4 w-4 rounded-full object-cover" />
                      {dp.shortLabel} · {dp.answers.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
              <Link to="/p/$slug" params={{ slug: persona.slug }} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Abrir página pública <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
              <div className="inline-flex rounded-lg border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setDemoView("deck")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition active:scale-95 sm:text-sm ${
                    demoView === "deck" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Presentation className="h-3.5 w-3.5" /> Pitch Deck (5 Slides)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoView("site")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition active:scale-95 sm:text-sm ${
                    demoView === "site" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" /> Dossiê Web Completo
                </button>
              </div>

              <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDemoTheme(t.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                      demoTheme === t.id ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label} · {t.layoutLabel}
                  </button>
                ))}
              </div>
            </div>

            {demoView === "deck" ? (
              <PitchDeck p={activePortfolio} deck={activeDeck} theme={demoTheme} />
            ) : (
              <div className="max-h-[540px] overflow-y-auto rounded-lg border border-border">
                <PortfolioSite p={activePortfolio} theme={demoTheme} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Asymmetric 1/3 + 2/3 Editorial Ledger (replaces symmetrical 3-card feature row) */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.35fr] lg:gap-16">
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-semibold text-primary">Como funciona</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Três etapas para sair do currículo genérico.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Em vez de exigir que você saiba redigir um currículo corporativo do zero, traduzimos trabalhos práticos, TCC, extensão, iniciação científica ou projetos em evidências claras.
              </p>
            </div>

            {/* Interactive STAR Transformation Simulator */}
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-primary">
                  <Wand2 className="h-3.5 w-3.5" /> Simulador de Transformação STAR
                </span>
                <span className="text-[10px] text-muted-foreground">Clique para testar:</span>
              </div>

              {/* Selector Pills */}
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Casos de exemplo STAR">
                {SIMULATOR_EXAMPLES.map((ex, i) => {
                  const active = i === simIdx;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => selectSimulatorExample(i)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {ex.tabLabel}
                    </button>
                  );
                })}
              </div>

              {/* Raw Academic Note (Before) */}
              <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 p-3">
                {isScanning && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/15 via-transparent to-transparent animate-pulse" />
                )}
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Antes · {SIMULATOR_EXAMPLES[simIdx]!.rawLabel}</span>
                  <span className="font-mono text-[10px]">{SIMULATOR_EXAMPLES[simIdx]!.category}</span>
                </div>
                <p className="mt-1.5 text-xs italic leading-relaxed text-muted-foreground">
                  {SIMULATOR_EXAMPLES[simIdx]!.rawText}
                </p>
              </div>

              {/* Interactive Transformation Indicator */}
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className={`h-3.5 w-3.5 ${isScanning ? "animate-spin text-primary" : ""}`} />
                <span>{isScanning ? "Estruturando caso com IA…" : "Estruturado pelo Método STAR"}</span>
              </div>

              {/* Structured STAR Executive Case (After) */}
              <div
                className={`relative overflow-hidden rounded-lg border border-primary/30 bg-primary/5 p-3.5 transition-all duration-300 ${
                  isScanning ? "opacity-40 scale-[0.99]" : "opacity-100 scale-100"
                }`}
              >
                <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                  <span className="text-xs font-semibold text-primary">
                    Depois · Evidência Executiva
                  </span>
                  <span className="rounded bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground shadow-xs">
                    {SIMULATOR_EXAMPLES[simIdx]!.star.metric}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5 text-xs">
                  <p className="leading-snug">
                    <strong className="text-primary font-semibold">S / T:</strong>{" "}
                    <span className="text-foreground">{SIMULATOR_EXAMPLES[simIdx]!.star.situation}</span>
                  </p>
                  <p className="leading-snug">
                    <strong className="text-primary font-semibold">Ação:</strong>{" "}
                    <span className="text-foreground">{SIMULATOR_EXAMPLES[simIdx]!.star.action}</span>
                  </p>
                  <p className="leading-snug">
                    <strong className="text-primary font-semibold">Resultado:</strong>{" "}
                    <span className="font-medium text-foreground">{SIMULATOR_EXAMPLES[simIdx]!.star.result}</span>
                  </p>
                </div>
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
              <div key={num} className="group grid gap-3 rounded-xl p-3 transition-colors hover:bg-muted/40 py-6 first:pt-4 lg:first:pt-0 sm:grid-cols-[56px_1fr]">
                <span className="font-mono text-sm font-bold text-primary transition-transform group-hover:scale-110">{num}</span>
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
              <p className="text-xs font-semibold text-primary">Parcerias Institucionais</p>
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

              {/* Contextual Institutional Directory Preview (Clickable Personas) */}
              <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                {DEMO_PERSONAS.map((dp) => {
                  const active = persona.id === dp.id;
                  return (
                    <button
                      key={dp.id}
                      type="button"
                      onClick={() => {
                        selectPersona(dp);
                        document.getElementById("vitrine-interativa")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <img src={dp.avatarUrl} alt={dp.answers.name} className="h-9 w-9 shrink-0 rounded-lg border border-border object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">{dp.answers.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{dp.courseShort}</p>
                        <span className="mt-0.5 inline-block rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-primary">
                          {dp.badgeMetric}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-2">
                <Button asChild variant="outline" className="rounded-lg">
                  <Link to="/instituicoes">
                    Abrir Vitrine Institucional & Catálogo QR <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between border-t border-border bg-secondary/45 p-7 sm:p-10 lg:border-l lg:border-t-0">
              <div>
                <span className="inline-block rounded bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
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
