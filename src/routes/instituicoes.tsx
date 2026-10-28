import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Globe, Presentation, Printer, QrCode, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/pf/Logo";
import { AvatarBadge } from "@/components/pf/PortfolioSite";
import { DEMO_PERSONAS, buildPersonaPortfolio, type Portfolio } from "@/lib/portfolio";
import { portfolioSchema } from "@/validators/portfolio";

export const Route = createFileRoute("/instituicoes")({
  head: () => ({
    meta: [
      { title: "Para Instituições e Feiras de Carreira — PitchFolio" },
      { name: "description", content: "Vitrine verificada de talentos no Método STAR e catálogo QR para universidades, escolas técnicas e feiras de carreira." },
      { property: "og:title", content: "Vitrine Institucional — PitchFolio" },
      { property: "og:description", content: "Diretório de formandos estruturado no Método STAR e catálogo QR para recrutadores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InstituicoesPage,
});

type DirectoryEntry = {
  slug: string;
  areaCategory: "Tecnologia" | "Gestão & Negócios" | "Design & Comunicação" | "Comunidade";
  portfolio: Portfolio;
  isLivePublished?: boolean;
};

const BASE_ENTRIES: DirectoryEntry[] = DEMO_PERSONAS.map((dp) => ({
  slug: dp.slug,
  areaCategory:
    dp.id === "ana"
      ? "Tecnologia"
      : dp.id === "lucas"
        ? "Gestão & Negócios"
        : "Design & Comunicação",
  portfolio: buildPersonaPortfolio(dp),
}));

function inferAreaCategory(role: string): DirectoryEntry["areaCategory"] {
  const r = role.toLowerCase();
  if (/(software|computa|dados|sistemas|dev|engenharia|ti|web)/.test(r)) return "Tecnologia";
  if (/(admin|gest|negócios|finan|economia|contábeis|marketing|comercial)/.test(r)) return "Gestão & Negócios";
  if (/(design|comunica|arquitetura|ux|publicidade|jornalismo|letras|artes)/.test(r)) return "Design & Comunicação";
  return "Comunidade";
}

function InstituicoesPage() {
  const [entries, setEntries] = useState<DirectoryEntry[]>(BASE_ENTRIES);
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("Todas");
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [mode, setMode] = useState<"directory" | "qr_catalog">("directory");
  const [originUrl, setOriginUrl] = useState("https://pitchfolio.app");

  useEffect(() => {
    setOriginUrl(window.location.origin);
    (async () => {
      try {
        const { data } = await supabase
          .from("portfolios")
          .select("slug, data, updated_at")
          .eq("is_published", true)
          .order("updated_at", { ascending: false })
          .limit(24);
        if (!data?.length) return;
        const remoteEntries: DirectoryEntry[] = [];
        const seen = new Set(BASE_ENTRIES.map((b) => b.slug));
        for (const row of data) {
          if (!row.slug || seen.has(row.slug)) continue;
          const parsed = portfolioSchema.safeParse(row.data);
          if (parsed.success) {
            seen.add(row.slug);
            remoteEntries.push({
              slug: row.slug,
              areaCategory: inferAreaCategory(parsed.data.role),
              portfolio: parsed.data,
              isLivePublished: true,
            });
          }
        }
        if (remoteEntries.length > 0) {
          setEntries([...remoteEntries, ...BASE_ENTRIES]);
        }
      } catch {
        // Keep base entries when offline
      }
    })();
  }, []);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      for (const s of e.portfolio.skills) {
        const clean = s.trim();
        if (clean) counts.set(clean, (counts.get(clean) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
  }, [entries]);

  const totalSkillsMapped = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      for (const s of e.portfolio.skills) if (s.trim()) set.add(s.trim().toLowerCase());
    }
    return set.size;
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (areaFilter !== "Todas" && e.areaCategory !== areaFilter) return false;
      if (skillFilter && !e.portfolio.skills.some((s) => s.toLowerCase() === skillFilter.toLowerCase())) return false;
      if (!q) return true;
      const p = e.portfolio;
      return (
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.projectTitle.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [entries, areaFilter, skillFilter, query]);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 print:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link to="/">Visão do Candidato</Link></Button>
          <Button asChild variant="outline"><Link to="/editor">Meu portfólio</Link></Button>
          <Button asChild><Link to="/criar">Publicar meu perfil</Link></Button>
        </div>
      </header>

      {/* Editorial Cohort Header */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6 lg:pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
          <div>
            <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Parcerias Institucionais & Feiras de Carreira
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
              Vitrine verificada de talentos no <span className="text-primary">Método STAR</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Em vez de distribuir pastas com dezenas de currículos genéricos em PDF, universidades e feiras de carreira disponibilizam um diretório padronizado onde recrutadores filtram candidatos por evidência prática, resultados mensuráveis e QR Code.
            </p>
          </div>

          {/* Live Computed Cohort Ledger */}
          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="px-3 first:pl-1">
              <span className="font-mono text-xs font-bold text-primary">01</span>
              <p className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                {String(entries.length).padStart(2, "0")}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Dossiês STAR ativos</p>
            </div>
            <div className="px-3">
              <span className="font-mono text-xs font-bold text-primary">02</span>
              <p className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
                {totalSkillsMapped}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Competências mapeadas</p>
            </div>
            <div className="px-3 last:pr-1">
              <span className="font-mono text-xs font-bold text-primary">03</span>
              <p className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">100%</p>
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Gratuito para alunos</p>
            </div>
          </div>
        </div>

        {/* Filter & Operational Mode Toolbar */}
        <div className="mt-8 space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar candidato por nome, curso, projeto ou habilidade…"
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setMode("directory")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    mode === "directory" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" /> Diretório STAR
                </button>
                <button
                  type="button"
                  onClick={() => setMode("qr_catalog")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    mode === "qr_catalog" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" /> Catálogo QR para Feira
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-lg">
                <Printer className="mr-1.5 h-3.5 w-3.5" /> Imprimir Catálogo
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-muted-foreground">Área:</span>
              {["Todas", "Tecnologia", "Gestão & Negócios", "Design & Comunicação"].map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setAreaFilter(area)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    areaFilter === area
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-muted-foreground">Competências da turma:</span>
              {topSkills.slice(0, 6).map((skill) => {
                const active = skillFilter?.toLowerCase() === skill.toLowerCase();
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSkillFilter(active ? null : skill)}
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
              {skillFilter && (
                <button
                  type="button"
                  onClick={() => setSkillFilter(null)}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Limpar filtro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mode 1: Editorial Candidate Ledger */}
        {mode === "directory" ? (
          <div className="mt-6 space-y-4">
            {filtered.map((item) => {
              const p = item.portfolio;
              return (
                <article
                  key={item.slug}
                  className="grid gap-6 rounded-xl border border-border bg-card p-6 shadow-xs transition hover:border-primary/40 lg:grid-cols-[260px_1fr_210px]"
                >
                  {/* Candidate Identity Column */}
                  <div className="space-y-3 border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                    <div className="flex items-center gap-3">
                      <AvatarBadge p={p} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="truncate font-display text-lg font-bold text-foreground">{p.name}</h2>
                          {item.isLivePublished && (
                            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">Novo</span>
                          )}
                        </div>
                        <p className="truncate text-xs font-medium text-muted-foreground">{p.role}</p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{p.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.skills.slice(0, 5).map((s) => (
                        <span key={s} className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* STAR Evidence Column */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Caso Verificado · Método STAR</span>
                        <h3 className="font-display text-base font-bold text-foreground">{p.projectTitle || "Projeto em destaque"}</h3>
                      </div>
                      {p.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.metrics.map((m) => (
                            <span key={m} className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-3">
                      <div className="rounded-lg border border-border bg-background/60 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">01 · Desafio</span>
                        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-foreground">{p.challenge}</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background/60 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">02 · Ação na prática</span>
                        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-foreground">{p.action}</p>
                      </div>
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">03 · Resultado</span>
                        <p className="mt-1 line-clamp-3 text-xs font-semibold leading-relaxed text-foreground">{p.result}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recruiter Actions Column */}
                  <div className="flex flex-col justify-between border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Objetivo</span>
                      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{p.goal}</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 print:hidden">
                      <Button asChild size="sm" className="w-full justify-between rounded-lg">
                        <Link to="/p/$slug" params={{ slug: item.slug }} search={{ view: "deck" }}>
                          <span className="inline-flex items-center gap-1.5"><Presentation className="h-3.5 w-3.5" /> Abrir 5 Slides</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full justify-between rounded-lg">
                        <Link to="/p/$slug" params={{ slug: item.slug }}>
                          <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Ver Dossiê Web</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Mode 2: Printable Career Fair QR Badge Catalog */
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const p = item.portfolio;
              const publicUrl = `${originUrl}/p/${item.slug}`;
              const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(publicUrl)}`;
              return (
                <div
                  key={item.slug}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs break-inside-avoid"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarBadge p={p} size="md" />
                        <div className="min-w-0">
                          <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {item.areaCategory}
                          </span>
                          <h2 className="mt-1 truncate font-display text-lg font-bold text-foreground">{p.name}</h2>
                          <p className="truncate text-xs text-muted-foreground">{p.role}</p>
                        </div>
                      </div>
                      <img
                        src={qrSrc}
                        alt={`QR Code de ${p.name}`}
                        width={76}
                        height={76}
                        className="h-19 w-19 shrink-0 rounded-lg border border-border bg-white p-1"
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold text-foreground">{p.projectTitle || "Projeto em destaque"}</p>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.result}</p>
                      {p.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {p.metrics.map((m) => (
                            <span key={m} className="rounded bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span className="text-[11px] font-medium text-muted-foreground">Aponte a câmera para abrir os 5 slides</span>
                    <Link
                      to="/p/$slug"
                      params={{ slug: item.slug }}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline print:hidden"
                    >
                      Abrir <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Institutional Licensing Callout */}
      <section className="border-t border-border bg-card print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Implantação para Universidades e Eventos</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Leve o PitchFolio para a próxima feira de carreiras da sua instituição</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Os estudantes criam seus portfólios gratuitamente em menos de 10 minutos e a coordenação recebe a vitrine padronizada da turma com catálogo QR pronto para empresas parceiras.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-lg">
              <Link to="/criar">Testar criação de dossiê <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
