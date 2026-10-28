import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-20 pt-6 lg:grid-cols-[0.9fr_1.2fr] lg:gap-14 lg:pt-12">
        <div className="lg:pt-4">
          <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
            Empregabilidade & 1ª Oportunidade
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl">
            Transforme projetos acadêmicos e código em um <span className="text-primary">pitch de 5 slides</span>.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Quem busca o primeiro emprego trava na página em branco. O PitchFolio lê seu GitHub, seu PDF do LinkedIn ou suas respostas guiadas e estrutura um dossiê pelo Método STAR pronto para entrevistas.
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
          </div>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Sem cadastro prévio · Importação via GitHub API ou PDF
          </p>
        </div>

        {/* Live Interactive 5-Slide Deck right in the Hero */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>Demonstração ao vivo · Navegue pelos 5 slides</span>
            <Link to="/p/$slug" params={{ slug: "ana-souza-demo" }} className="font-semibold text-primary hover:underline">
              /p/ana-souza-demo →
            </Link>
          </div>
          <PitchDeck p={DEMO_PORTFOLIO} deck={DEMO_DECK} theme="moderno" />
        </div>
      </section>

      {/* Asymmetric 1/3 + 2/3 Editorial Ledger (replaces symmetrical 3-card feature row) */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs font-semibold text-primary">01 / Como funciona</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Três etapas para sair do currículo genérico.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Em vez de exigir que você saiba redigir um currículo corporativo do zero, traduzimos trabalhos práticos, TCC, iniciação científica ou repositórios em evidências claras.
            </p>
          </div>

          <div className="divide-y divide-border border-t border-border lg:border-t-0">
            {[
              {
                num: "01",
                tag: "GitHub API · PDF · Guiado",
                t: "Coleta sem síndrome da página em branco",
                d: "Sincronize seus repositórios públicos do GitHub, envie o PDF exportado do LinkedIn ou use modelos de frases prontas para contar sua história em 3 passos.",
              },
              {
                num: "02",
                tag: "Método STAR · Fact-Safe",
                t: "Estruturação executiva sem inventar dados",
                d: "A IA organiza seu projeto principal em Contexto, Ação na prática e Resultados mensuráveis — mantendo 100% de fidelidade aos fatos que você informou.",
              },
              {
                num: "03",
                tag: "Link /p/slug · QR Code · PDF",
                t: "Dois formatos prontos para o recrutador",
                d: "Com um clique, publique uma página web de leitura rápida e um Pitch Deck interativo de 5 slides (com modo tela cheia e impressão nativa em PDF).",
              },
            ].map(({ num, tag, t, d }) => (
              <div key={num} className="grid gap-3 py-6 first:pt-4 lg:first:pt-0 sm:grid-cols-[56px_1fr]">
                <span className="font-mono text-sm font-bold text-primary">{num}</span>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold">{t}</h3>
                    <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-secondary-foreground">
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
              <p className="font-mono text-xs font-semibold text-primary">02 / Modelo B2B2C Sustentável</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Para Universidades, Bootcamps e Feiras de Carreira
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Instituições de ensino superior e escolas técnicas licenciam o PitchFolio para padronizar a vitrine de alunos formandos, conectar turmas inteiras a empresas parceiras e acompanhar taxas de empregabilidade por curso.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
                <span className="rounded-md border border-border bg-background px-3 py-1.5 font-medium">Diretório de Talentos Verificados</span>
                <span className="rounded-md border border-border bg-background px-3 py-1.5 font-medium">Catálogo QR para Feiras</span>
                <span className="rounded-md border border-border bg-background px-3 py-1.5 font-medium">Métricas por Coorte</span>
              </div>
            </div>

            <div className="flex flex-col justify-between border-t border-border bg-secondary/45 p-7 sm:p-10 lg:border-l lg:border-t-0">
              <div>
                <span className="inline-block rounded bg-primary px-2 py-0.5 font-mono text-[11px] font-bold text-primary-foreground">
                  100% Gratuito no B2C
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
