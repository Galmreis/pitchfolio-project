import { Github, Linkedin, Mail } from "lucide-react";
import { normalizeUrl, type Portfolio, type ThemeName } from "@/lib/portfolio";

export function PortfolioSite({ p, theme }: { p: Portfolio; theme: ThemeName }) {
  const initials = p.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={`theme-${theme} bg-pf-bg text-pf-fg`}>
      {/* Editorial Dossier Header */}
      <section className="mx-auto max-w-4xl px-6 pb-14 pt-12 md:px-10 md:pt-16">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-pf-line pb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-lg bg-pf-accent font-mono text-sm font-bold text-pf-accent-fg shadow-xs">
              {initials || "PF"}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl">{p.name || "Seu nome"}</h1>
              <p className="mt-0.5 font-mono text-xs text-pf-muted">{p.role || "Área de atuação"}</p>
            </div>
          </div>
          <ContactLinks p={p} />
        </div>

        <div className="mt-10 max-w-2xl">
          {p.headline && p.headline !== p.role && (
            <p className="font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{p.headline}</p>
          )}
          <p className="mt-4 text-base leading-relaxed text-pf-muted md:text-lg">{p.bio}</p>
        </div>
      </section>

      {/* 01 · Case Study (STAR Method) */}
      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-14 md:px-10">
        <div>
          <span className="font-mono text-xs text-pf-muted">01 / Caso em destaque (Método STAR)</span>
          <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">{p.projectTitle || "Projeto em destaque"}</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[0.95fr_1.15fr]">
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
                  <span key={i} className="rounded-md bg-pf-accent px-3 py-1.5 font-mono text-xs font-bold text-pf-accent-fg shadow-xs">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 02 · Skills & Journey (2-Column Editorial Split) */}
      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-14 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="font-mono text-xs text-pf-muted">02 / Competências</span>
            <h2 className="mt-1 font-display text-xl font-bold">Habilidades essenciais</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.skills.map((s, i) => (
                <span key={i} className="rounded-lg border border-pf-line bg-pf-card px-3.5 py-2 text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {p.journey.length > 0 && (
            <div>
              <span className="font-mono text-xs text-pf-muted">03 / Trajetória</span>
              <h2 className="mt-1 font-display text-xl font-bold">Marcos e evolução</h2>
              <ol className="mt-5 space-y-4 border-l-2 border-pf-line pl-5">
                {p.journey.map((j, i) => (
                  <li key={i} className="relative text-sm leading-relaxed text-pf-muted">
                    <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-pf-accent" />
                    <span className="text-pf-fg">{j}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* 03 · Next Step & Contact */}
      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-14 pb-20 md:px-10">
        <span className="font-mono text-xs text-pf-muted">04 / Próximo passo</span>
        <p className="mt-3 max-w-2xl font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{p.goal}</p>
        <ContactLinks p={p} className="mt-8" />
      </section>
    </div>
  );
}

export function ContactLinks({ p, className = "" }: { p: Portfolio; className?: string }) {
  const items = [
    p.linkedin && { icon: Linkedin, label: "LinkedIn", href: normalizeUrl(p.linkedin) },
    p.github && { icon: Github, label: "GitHub", href: normalizeUrl(p.github) },
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
