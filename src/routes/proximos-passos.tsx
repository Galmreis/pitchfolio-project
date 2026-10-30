import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  GraduationCap,
  Layers,
  Maximize2,
  Minimize2,
  Presentation,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/pf/Logo";

export const Route = createFileRoute("/proximos-passos")({
  head: () => ({
    meta: [
      { title: "Próximos Passos e Visão de Futuro — PitchFolio" },
      {
        name: "description",
        content:
          "Roadmap estratégico e direcionamento de produto do PitchFolio para o Case 3 (Empregabilidade e Carreira): do MVP ao SaaS institucional.",
      },
      { property: "og:title", content: "Próximos Passos — PitchFolio" },
      {
        property: "og:description",
        content:
          "Do Hackathon à escala real: expansão para universidades, transcrição por voz, portal do recrutador e IA para entrevistas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProximosPassosPage,
});

type PillarPhase = {
  num: string;
  tag: string;
  title: string;
  horizon: string;
  status: "completed" | "in_progress" | "planned";
  statusLabel: string;
  description: string;
  highlights: {
    icon: typeof Rocket;
    title: string;
    description: string;
    metric?: string;
  }[];
  pitchTalkingPoint: string;
};

const PHASES: PillarPhase[] = [
  {
    num: "01",
    tag: "Fase Atual · Hackathon MVP",
    title: "Motor de Geração e Apresentação STAR",
    horizon: "Entregue e Operacional",
    status: "completed",
    statusLabel: "Concluído & Validado",
    description:
      "Eliminamos a barreira da página em branco transformando experiências brutas em um case estruturado com dossiê web e pitch deck de 5 slides.",
    highlights: [
      {
        icon: Sparkles,
        title: "Ingestão Flexível em 3 Minutos",
        description:
          "Importação de PDF de currículo, texto do LinkedIn ou formulário guiado em 3 passos simples.",
        metric: "100% no navegador",
      },
      {
        icon: Presentation,
        title: "Pitch Deck + Dossiê Integrados",
        description:
          "Página web pública sob link permanente (/p/:slug) com QR Code e deck de 5 slides navegável.",
        metric: "1 link permanente",
      },
      {
        icon: Bot,
        title: "Simulador de Entrevista com IA STAR",
        description:
          "Banca virtual que gera perguntas situacionais e dá feedback construtivo baseado no projeto do candidato.",
        metric: "Feedback em tempo real",
      },
      {
        icon: ShieldCheck,
        title: "Exportação em PDF Nativa e Responsiva",
        description:
          "Impressão de alta fidelidade em PDF para o Pitch Deck (16:9) e para o Currículo Executivo A4 formal.",
        metric: "Zero folha em branco",
      },
    ],
    pitchTalkingPoint:
      "Provamos que a tecnologia funciona em ambiente de teste real: o candidato sai de zero a um portfólio executivo pronto para entrevistas em menos de 10 minutos.",
  },
  {
    num: "02",
    tag: "Fase 1 · Próximos 30–60 Dias",
    title: "Piloto Universitário & Ingestão por Voz",
    horizon: "Pós-Hackathon (Mês 1–2)",
    status: "in_progress",
    statusLabel: "Em Estruturação",
    description:
      "Validação em campo através do módulo institucional para universidades e quebra da barreira de escrita através de áudio no WhatsApp.",
    highlights: [
      {
        icon: Volume2,
        title: "Áudio no WhatsApp (Voice-to-STAR)",
        description:
          "O jovem grava um áudio contando o que fez; Whisper AI transcreve e estrutura os 4 quadrantes STAR sem exigir redação prévia.",
        metric: "Acessibilidade total",
      },
      {
        icon: Building2,
        title: "Piloto com Carreiras UFPE / PUC",
        description:
          "Implantação do catálogo QR (/instituicoes) para feiras de estágio presenciais, com crachás escaneáveis pelos recrutadores.",
        metric: "3 faculdades-piloto",
      },
      {
        icon: TrendingUp,
        title: "Analytics de Leitura para o Candidato",
        description:
          "Notificação via WhatsApp/E-mail toda vez que um recrutador ou líder de área abrir o pitch deck ou escanear o QR Code.",
        metric: "Transparência ao aluno",
      },
      {
        icon: Layers,
        title: "Curadoria de Destaques e Portfólio Modular",
        description:
          "Possibilidade de manter múltiplos projetos e ativar/desativar seções conforme a vaga pretendida com 1 clique.",
        metric: "Versões por vaga",
      },
    ],
    pitchTalkingPoint:
      "O próximo passo operacional não é código abstrato: é rodar a vitrine institucional em uma feira de carreiras universitária e medir o aumento nas taxas de entrevista.",
  },
  {
    num: "03",
    tag: "Fase 2 · Próximos 3–6 Meses",
    title: "Portal do Recrutador & Validação de Evidências",
    horizon: "Trimestre 2 (Mês 3–6)",
    status: "planned",
    statusLabel: "Planejado",
    description:
      "Transformação do PitchFolio de ferramenta do candidato em um marketplace de talentos pré-validados por competência prática.",
    highlights: [
      {
        icon: Briefcase,
        title: "ATS Inverso: Busca por Evidência STAR",
        description:
          "Recrutadores não filtram mais por nome da faculdade, mas por problema resolvido (Ex: 'candidatos que automatizaram processos manuais').",
        metric: "Fim da triagem cega",
      },
      {
        icon: ShieldCheck,
        title: "Proof of Work & Badges Verificados",
        description:
          "Integração direta com APIs do GitHub (análise de pull requests reais), certificados da Alura/Coursera e projetos acadêmicos.",
        metric: "Sem currículo inflado",
      },
      {
        icon: Video,
        title: "Coach de Entrevista com Avatar de IA",
        description:
          "Treinamento comportamental em áudio e vídeo simulando o gestor da vaga, analisando clareza de dicção e assertividade na resposta.",
        metric: "Confiança na banca",
      },
      {
        icon: Users,
        title: "Pool Compartilhado de Estágios",
        description:
          "Startups parceiras acessam banco de talentos pré-avaliados com contratação rápida e sem custos de intermediários predatórios.",
        metric: "Match rápido",
      },
    ],
    pitchTalkingPoint:
      "Resolvemos a dor dupla: o jovem ganha visibilidade com evidência prática, e a empresa economiza até 70% do tempo gasto em triagens de currículos genéricos.",
  },
  {
    num: "04",
    tag: "Fase 3 · Escala & Sustentabilidade",
    title: "Modelo de Negócio e Impacto Social",
    horizon: "Longo Prazo",
    status: "planned",
    statusLabel: "Visão de Escala",
    description:
      "Garantir a gratuidade permanente para quem busca o primeiro emprego enquanto monetizamos soluções corporativas e institucionais.",
    highlights: [
      {
        icon: GraduationCap,
        title: "100% Gratuito Para Estudantes",
        description:
          "Criar, editar, exportar em PDF, simular entrevistas e publicar link público nunca terá cobrança para quem busca trabalho.",
        metric: "R$ 0 para o aluno",
      },
      {
        icon: Building2,
        title: "SaaS para Universidades e Escolas Técnicas",
        description:
          "Assinatura anual para centros de carreiras gerenciarem colocações, gerarem relatórios de empregabilidade e realizarem feiras.",
        metric: "B2B Institucional",
      },
      {
        icon: Compass,
        title: "Assinatura Pro para Recrutadores (B2B)",
        description:
          "Planos corporativos para hunting ativo de estagiários e juniores qualificados pelo Método STAR com contato direto.",
        metric: "Monetização B2B",
      },
      {
        icon: Rocket,
        title: "Internacionalização (EN / ES)",
        description:
          "Expansão para vagas remotas globais, permitindo que talentos brasileiros compitam por estágios internacionais em dólar.",
        metric: "Mercado Global",
      },
    ],
    pitchTalkingPoint:
      "Nosso modelo é sustentável porque a monetização recai sobre quem tem orçamento (empresas e faculdades), mantendo a porta de entrada sempre aberta para os jovens.",
  },
];

function ProximosPassosPage() {
  const [slideMode, setSlideMode] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveSlide((curr) => Math.min(PHASES.length - 1, curr + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((curr) => Math.max(0, curr - 1));
  }, []);

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!slideMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey) toggleFs();
      if (e.key === "Escape" && !document.fullscreenElement) setSlideMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideMode, nextSlide, prevSlide, toggleFs]);

  const curr = PHASES[activeSlide] ?? PHASES[0]!;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <Logo />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/instituicoes">Para Instituições</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/editor">Editor</Link>
            </Button>
            <Button
              variant={slideMode ? "default" : "outline"}
              size="sm"
              onClick={() => setSlideMode(!slideMode)}
              className="rounded-lg gap-1.5"
            >
              <Presentation className="h-4 w-4" />
              {slideMode ? "Ver Página Completa" : "Modo Slide de Pitch"}
            </Button>
            <Button asChild size="sm">
              <Link to="/criar">Experimentar MVP</Link>
            </Button>
          </div>
        </div>
      </header>

      {slideMode ? (
        /* =========================================================================
         * MODE 1: Presentation Slide Deck (Ready for pitch projection)
         * ========================================================================= */
        <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                SLIDE {activeSlide + 1} DE {PHASES.length}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">Use as setas ← → para apresentar</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleFs} className="h-8 text-xs">
                {isFullscreen ? <Minimize2 className="mr-1 h-3.5 w-3.5" /> : <Maximize2 className="mr-1 h-3.5 w-3.5" />}
                {isFullscreen ? "Sair da tela cheia" : "Tela cheia (F)"}
              </Button>
            </div>
          </div>

          {/* Slide Frame */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-2xl flex flex-col justify-between">
            {/* Slide Header */}
            <div className="flex items-start justify-between border-b border-border/80 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">{curr.tag}</span>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{curr.title}</h2>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
                  {curr.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  {curr.statusLabel}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">{curr.horizon}</p>
              </div>
            </div>

            {/* Slide Content Grid */}
            <div className="my-auto py-4">
              <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">{curr.description}</p>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {curr.highlights.map((h, i) => (
                  <div key={i} className="rounded-xl border border-border bg-background/60 p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h.icon className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-bold">{h.title}</h4>
                      </div>
                      {h.metric && (
                        <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                          {h.metric}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{h.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Speaker Footer / Pitch Line */}
            <div className="border-t border-border/80 pt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono font-bold text-primary">Ponto-Chave para a Banca:</span>
                <span className="italic">"{curr.pitchTalkingPoint}"</span>
              </div>
              <div className="flex items-center gap-1">
                {PHASES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Ir para slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeSlide ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Slide Deck Controls */}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevSlide} disabled={activeSlide === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Fase Anterior
            </Button>
            <div className="flex gap-1.5">
              {PHASES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    idx === activeSlide
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-mono">{p.num}</span> · {p.title.split(" ")[0]}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={nextSlide} disabled={activeSlide === PHASES.length - 1}>
              Próxima Fase <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </main>
      ) : (
        /* =========================================================================
         * MODE 2: Full Detailed Roadmap Overview Page
         * ========================================================================= */
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
          {/* Hero */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
              <Compass className="h-3.5 w-3.5" /> Visão Estratégica & Próximos Passos
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              O futuro do PitchFolio: Da validação no Hackathon à escala real.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              O Case 3 (Empregabilidade e Carreira) exige mais do que um gerador de portfólio.
              Apresentamos o mapa de execução estruturado em 4 fases: o que já opera hoje, o piloto
              universitário nos próximos 60 dias e o modelo de negócio sustentável.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={() => setSlideMode(true)} className="rounded-lg gap-2">
                <Presentation className="h-4 w-4" /> Apresentar em Modo Slide de Pitch
              </Button>
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/instituicoes">Ver Módulo Institucional Atual <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="font-mono text-xs font-semibold text-muted-foreground">Etapa 01</span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">100%</p>
              <p className="mt-0.5 text-xs text-muted-foreground">MVP Operacional no ar</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="font-mono text-xs font-semibold text-muted-foreground">Etapa 02</span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">60 Dias</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Piloto B2B com universidades</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="font-mono text-xs font-semibold text-muted-foreground">Etapa 03</span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">ATS STAR</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Busca ativa de recrutadores</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="font-mono text-xs font-semibold text-muted-foreground">Etapa 04</span>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground">R$ 0</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Para o jovem estudante</p>
            </div>
          </div>

          {/* Timeline Cards */}
          <div className="mt-16 space-y-12">
            {PHASES.map((phase) => (
              <section
                key={phase.num}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-mono text-sm font-extrabold text-primary-foreground shadow-xs">
                      {phase.num}
                    </span>
                    <div>
                      <span className="font-mono text-xs font-bold text-primary uppercase">{phase.tag}</span>
                      <h2 className="font-display text-xl sm:text-2xl font-bold">{phase.title}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
                      {phase.statusLabel}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">· {phase.horizon}</span>
                  </div>
                </div>

                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">{phase.description}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {phase.highlights.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-border bg-background/50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                        </div>
                        {item.metric && (
                          <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                            {item.metric}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                  <span className="font-mono font-bold text-primary shrink-0 uppercase tracking-wider">
                    Argumento no Pitch:
                  </span>
                  <p className="italic text-foreground">{phase.pitchTalkingPoint}</p>
                </div>
              </section>
            ))}
          </div>

          {/* Social Impact & Call to Action Banner */}
          <div className="mt-16 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 text-center">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
              Pronto para colocar sua história à frente dos recrutadores?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Sem cadastro prévio, sem complexidade técnica. Experimente agora o fluxo de criação em 3 passos
              e gere seu Pitch Deck executivo pelo Método STAR.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-lg px-6 font-semibold">
                <Link to="/criar">Criar meu PitchFolio agora <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-lg px-6">
                <Link to="/">Voltar à Página Inicial</Link>
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-border py-8 text-center text-xs text-muted-foreground print:hidden">
        <p>PitchFolio — Hackathon Startups & Lovable · Case 3: Empregabilidade e Carreira</p>
      </footer>
    </div>
  );
}
