import { Award, Github, Globe, Linkedin, Mail } from "lucide-react";
import { normalizeUrl, resolveLayoutStyle, type Portfolio, type ThemeName } from "@/lib/portfolio";
import type { PortfolioSections } from "@/services/portfolioSections.service";

export function AvatarBadge({ p, size = "md" }: { p: Portfolio; size?: "sm" | "md" | "lg" }) {
  const initials = p.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const dim = size === "lg" ? "h-16 w-16 rounded-xl text-base" : size === "sm" ? "h-11 w-11 rounded-lg text-xs" : "h-14 w-14 rounded-xl text-sm";
  if (p.avatarUrl) {
    return (
      <img
        src={p.avatarUrl}
        alt={p.name || "Foto de perfil"}
        className={`${dim} shrink-0 border border-pf-line bg-pf-card object-cover shadow-xs`}
      />
    );
  }
  return (
    <div className={`flex ${dim} shrink-0 items-center justify-center bg-pf-accent font-display font-bold text-pf-accent-fg shadow-xs`}>
      {initials || "PF"}
    </div>
  );
}

function ProjectVisual({ p }: { p: Portfolio }) {
  if (!p.projectImageUrl) return null;
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-pf-line bg-pf-card shadow-sm">
      <img
        src={p.projectImageUrl}
        alt={p.projectTitle || "Prévia visual do projeto"}
        className="aspect-video w-full object-cover"
      />
    </div>
  );
}

export function PortfolioSite({ p, theme, sections }: { p: Portfolio; theme: ThemeName; sections?: PortfolioSections | undefined }) {
  const accentClass = p.accentColor ? `pf-accent-${p.accentColor}` : "";
  const journeyFirst = p.sectionOrder === "journey_first";
  const layout = resolveLayoutStyle(theme, p.layoutStyle);

  const certificationsBlock =
    sections && sections.certifications.length > 0 ? (
      <div className="mt-8 border-t border-pf-line pt-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Certificações & Formação Complementar</span>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {sections.certifications.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 rounded-lg border border-pf-line bg-pf-card p-3">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-pf-accent" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-pf-fg">{c.title}</p>
                <p className="text-[11px] text-pf-muted">{c.issuer.trim()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  /* =========================================================================
   * LAYOUT 1: "split" (Default for "Quente" — Left Sticky Dossier Sidebar)
   * ========================================================================= */
  if (layout === "split") {
    const splitProject = (
      <section key="project" className="space-y-5 border-b border-pf-line pb-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Caso em destaque · Método STAR</span>
          <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">{p.projectTitle || "Projeto em destaque"}</h2>
        </div>

        <ProjectVisual p={p} />

        <div className="space-y-4">
          <div className="rounded-lg border border-pf-line bg-pf-card p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-pf-muted">01 · Contexto & Desafio</span>
            <p className="mt-2 text-sm leading-relaxed text-pf-fg">{p.challenge}</p>
          </div>
          <div className="rounded-lg border border-pf-line bg-pf-card p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-pf-muted">02 · Execução na prática</span>
            <p className="mt-2 text-sm leading-relaxed text-pf-fg">{p.action}</p>
          </div>
          <div className="rounded-lg border-l-4 border-pf-accent bg-pf-card p-6 shadow-xs">
            <span className="inline-block rounded bg-pf-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-pf-accent-fg">
              03 · Resultados & Impacto
            </span>
            <p className="mt-3 font-display text-lg font-semibold leading-snug text-pf-fg">{p.result}</p>
            {p.metrics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.metrics.map((m, i) => (
                  <span key={i} className="rounded-md bg-pf-accent/15 px-3 py-1 text-xs font-bold text-pf-fg">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );

    const splitJourney = p.journey.length > 0 ? (
      <section key="journey" className="space-y-5 border-b border-pf-line pb-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Trajetória & Experiência</span>
          <h2 className="mt-1 font-display text-2xl font-bold">Marcos e evolução</h2>
        </div>
        <ol className="space-y-4 border-l-2 border-pf-accent/40 pl-5">
          {p.journey.map((j, i) => (
            <li key={i} className="relative rounded-lg border border-pf-line bg-pf-card p-4 text-sm leading-relaxed text-pf-fg">
              <span className="absolute -left-[27px] top-5 h-3 w-3 rounded-full border-2 border-pf-bg bg-pf-accent" />
              {j}
            </li>
          ))}
        </ol>
        {certificationsBlock}
      </section>
    ) : null;

    return (
      <div className={`theme-${theme} ${accentClass} bg-pf-bg text-pf-fg`}>
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[280px_1fr] md:px-10 md:py-16">
          {/* Left Sticky Profile Column */}
          <aside className="space-y-6 md:sticky md:top-8 md:self-start rounded-xl border border-pf-line bg-pf-card p-6">
            <AvatarBadge p={p} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight tracking-tight">{p.name || "Seu nome"}</h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-pf-muted">{p.role || "Área de atuação"}</p>
            </div>
            <p className="text-sm leading-relaxed text-pf-muted">{p.bio}</p>

            <div className="border-t border-pf-line pt-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Habilidades</span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.skills.map((s, i) => (
                  <span key={i} className="rounded-md bg-pf-accent/15 px-2.5 py-1 text-xs font-semibold text-pf-fg">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-pf-line pt-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Contato</span>
              <ContactLinks p={p} className="mt-3" />
            </div>
          </aside>

          {/* Right Narrative Column */}
          <div className="space-y-10">
            {p.headline && p.headline !== p.role && (
              <div className="border-b border-pf-line pb-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Posicionamento</span>
                <p className="mt-2 font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">{p.headline}</p>
              </div>
            )}

            {journeyFirst ? [splitJourney, splitProject] : [splitProject, splitJourney]}

            <section className="space-y-3 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Próximo passo</span>
              <p className="font-display text-xl font-bold leading-snug md:text-2xl">{p.goal}</p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
   * LAYOUT 2: "indice" (Default for "Minimal" — Swiss Index / Read.cv Ledger)
   * ========================================================================= */
  if (layout === "indice") {
    const indexProject = (
      <section key="project" className="grid gap-6 border-t border-pf-line py-10 md:grid-cols-[200px_1fr]">
        <div>
          <span className="font-mono text-xs font-bold text-pf-accent">01</span>
          <h2 className="mt-1 text-xs font-bold uppercase tracking-wider text-pf-muted">Caso STAR</h2>
          {p.metrics.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              {p.metrics.map((m, i) => (
                <span key={i} className="inline-block w-fit border-l-2 border-pf-accent pl-2.5 font-mono text-xs font-bold text-pf-fg">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <h3 className="font-display text-xl font-bold md:text-2xl">{p.projectTitle || "Projeto em destaque"}</h3>
          <ProjectVisual p={p} />
          <div className="divide-y divide-pf-line border-t border-pf-line">
            {[
              { label: "Contexto & Desafio", val: p.challenge },
              { label: "Execução na prática", val: p.action },
              { label: "Resultados & Impacto", val: p.result },
            ].map(({ label, val }) => (
              <div key={label} className="grid gap-2 py-4 sm:grid-cols-[160px_1fr]">
                <span className="text-xs font-semibold text-pf-muted">{label}</span>
                <p className="text-sm leading-relaxed text-pf-fg">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );

    const indexJourney = (
      <section key="journey" className="grid gap-6 border-t border-pf-line py-10 md:grid-cols-[200px_1fr]">
        <div>
          <span className="font-mono text-xs font-bold text-pf-accent">02</span>
          <h2 className="mt-1 text-xs font-bold uppercase tracking-wider text-pf-muted">Trajetória & Habilidades</h2>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Competências essenciais</h3>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {p.skills.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-sm font-semibold text-pf-fg">
                  <span className="h-1.5 w-1.5 rounded-full bg-pf-accent" /> {s}
                </span>
              ))}
            </div>
          </div>
          {p.journey.length > 0 && (
            <div className="divide-y divide-pf-line border-t border-pf-line">
              {p.journey.map((j, i) => (
                <div key={i} className="grid gap-2 py-3.5 sm:grid-cols-[60px_1fr]">
                  <span className="font-mono text-xs text-pf-muted">0{i + 1}</span>
                  <p className="text-sm leading-relaxed text-pf-fg">{j}</p>
                </div>
              ))}
            </div>
          )}
          {certificationsBlock}
        </div>
      </section>
    );

    return (
      <div className={`theme-${theme} ${accentClass} bg-pf-bg text-pf-fg`}>
        <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
          <header className="grid gap-6 pb-10 md:grid-cols-[200px_1fr]">
            <div>
              <AvatarBadge p={p} size="md" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-pf-muted">{p.role || "Área de atuação"}</p>
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{p.name || "Seu nome"}</h1>
              {p.headline && p.headline !== p.role && (
                <p className="mt-2 font-display text-lg font-semibold text-pf-fg">{p.headline}</p>
              )}
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-pf-muted md:text-base">{p.bio}</p>
              <ContactLinks p={p} className="mt-5" />
            </div>
          </header>

          {journeyFirst ? [indexJourney, indexProject] : [indexProject, indexJourney]}

          <section className="grid gap-6 border-t border-pf-line pt-10 md:grid-cols-[200px_1fr]">
            <div>
              <span className="font-mono text-xs font-bold text-pf-accent">03</span>
              <h2 className="mt-1 text-xs font-bold uppercase tracking-wider text-pf-muted">Objetivo</h2>
            </div>
            <div>
              <p className="font-display text-xl font-semibold leading-snug md:text-2xl">{p.goal}</p>
              <ContactLinks p={p} className="mt-6" />
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* =========================================================================
   * LAYOUT 3: "bento" (Default for "Moderno" — Modular Bento Cards)
   * ========================================================================= */
  const projectSection = (
    <section key="project" className="mx-auto max-w-4xl border-t border-pf-line px-6 py-14 md:px-10">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Caso em destaque · Método STAR</span>
        <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">{p.projectTitle || "Projeto em destaque"}</h2>
      </div>

      <ProjectVisual p={p} />

      <div className="mt-6 grid gap-4 md:grid-cols-[0.95fr_1.15fr]">
        <div className="rounded-lg border border-pf-line bg-pf-card p-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-pf-accent/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-pf-fg">S / T</span>
            <h3 className="text-sm font-semibold">Contexto & Desafio</h3>
          </div>
          <p className="text-sm leading-relaxed text-pf-muted">{p.challenge}</p>
        </div>
        <div className="rounded-lg border border-pf-line bg-pf-card p-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-pf-accent/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-pf-fg">A</span>
            <h3 className="text-sm font-semibold">Execução na prática</h3>
          </div>
          <p className="text-sm leading-relaxed text-pf-muted">{p.action}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-pf-line border-l-4 border-l-pf-accent bg-pf-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-pf-accent px-1.5 py-0.5 font-mono text-[11px] font-bold text-pf-accent-fg">R</span>
              <h3 className="text-sm font-bold">Resultados & Impacto</h3>
            </div>
            <p className="text-sm leading-relaxed text-pf-fg sm:text-base">{p.result}</p>
          </div>
          {p.metrics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.metrics.map((m, i) => (
                <span key={i} className="rounded-md bg-pf-accent px-3 py-1.5 text-xs font-bold text-pf-accent-fg shadow-xs">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const journeySection = (
    <section key="journey" className="mx-auto max-w-4xl border-t border-pf-line px-6 py-14 md:px-10">
      <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Competências</span>
          <h2 className="mt-1 font-display text-xl font-bold">Habilidades essenciais</h2>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {p.skills.map((s, i) => (
              <div key={i} className="rounded-lg border border-pf-line bg-pf-card p-3 text-xs font-semibold">
                <span className="mb-1 block font-mono text-[10px] text-pf-accent">0{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        {p.journey.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Trajetória & Experiência</span>
            <h2 className="mt-1 font-display text-xl font-bold">Marcos e evolução</h2>
            <ol className="mt-5 space-y-4 border-l-2 border-pf-line pl-5">
              {p.journey.map((j, i) => (
                <li key={i} className="relative text-sm leading-relaxed text-pf-muted">
                  <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-pf-accent" />
                  <span className="text-pf-fg">{j}</span>
                </li>
              ))}
            </ol>
            {certificationsBlock}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className={`theme-${theme} ${accentClass} bg-pf-bg text-pf-fg`}>
      {/* Bento Dossier Header */}
      <section className="mx-auto max-w-4xl px-6 pb-14 pt-12 md:px-10 md:pt-16">
        <div className="grid gap-4 md:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-xl border border-pf-line bg-pf-card p-6">
            <div className="flex items-center gap-4">
              <AvatarBadge p={p} size="md" />
              <div>
                <h1 className="font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl">{p.name || "Seu nome"}</h1>
                <p className="mt-0.5 text-sm font-medium text-pf-muted">{p.role || "Área de atuação"}</p>
              </div>
            </div>
            {p.headline && p.headline !== p.role && (
              <p className="mt-5 font-display text-xl font-semibold leading-snug tracking-tight">{p.headline}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-pf-muted md:text-base">{p.bio}</p>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-pf-line bg-pf-card p-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Objetivo atual</span>
              <p className="mt-2 font-display text-base font-semibold leading-snug text-pf-fg">{p.goal}</p>
            </div>
            <div className="mt-6 border-t border-pf-line pt-4">
              <span className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-pf-muted">Canais diretos</span>
              <ContactLinks p={p} />
            </div>
          </div>
        </div>
      </section>

      {journeyFirst ? [journeySection, projectSection] : [projectSection, journeySection]}
    </div>
  );
}

export function ContactLinks({ p, className = "" }: { p: Portfolio; className?: string }) {
  const isGithub = /github\.com/i.test(p.github);
  const items = [
    p.linkedin && { icon: Linkedin, label: "LinkedIn", href: normalizeUrl(p.linkedin) },
    p.github && { icon: isGithub ? Github : Globe, label: isGithub ? "GitHub" : "Portfólio / Site", href: normalizeUrl(p.github) },
    p.email && { icon: Mail, label: p.email, href: `mailto:${p.email}` },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href: string }[];
  if (!items.length) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map(({ icon: Icon, label, href }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-pf-line bg-pf-card px-4 py-2 text-sm font-medium transition hover:bg-pf-accent hover:text-pf-accent-fg">
          <Icon className="h-4 w-4" /> {label}
        </a>
      ))}
    </div>
  );
}
