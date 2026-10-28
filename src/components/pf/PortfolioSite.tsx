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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-pf-line bg-pf-card font-mono text-sm font-semibold text-pf-fg">
              {initials || "PF"}
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight md:text-3xl">{p.name || "Seu nome"}</h1>
              <p className="mt-0.5 font-mono text-xs text-pf-muted">{p.role || "Área de atuação"}</p>
            </div>
          </div>
          <ContactLinks p={p} />
        </div>

        <div className="mt-10 max-w-2xl">
          {p.headline && p.headline !== p.role && (
            <p className="font-serif-editorial text-3xl leading-[1.15] md:text-4xl">{p.headline}</p>
          )}
          <p className="mt-4 text-base leading-relaxed text-pf-muted md:text-lg">{p.bio}</p>
        </div>
      </section>

      {/* 01 · Case Study (STAR Method) */}
      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-14 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-pf-muted">01 / Caso em destaque</span>
            <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{p.projectTitle || "Projeto em destaque"}</h2>
          </div>
          {p.metrics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.metrics.map((m, i) => (
                <span key={i} className="rounded-md border border-pf-line bg-pf-card px-3 py-1 font-mono text-xs font-medium text-pf-fg">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 border-t border-pf-line pt-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-pf-line">
          {[
            { num: "01", t: "Contexto & Desafio", d: p.challenge },
            { num: "02", t: "Execução na prática", d: p.action },
            { num: "03", t: "Resultados & Impacto", d: p.result },
          ].map(({ num, t, d }, idx) => (
            <div key={num} className={`space-y-2 ${idx > 0 ? "md:pl-6" : ""} ${idx < 2 ? "md:pr-6" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-pf-muted">{num}</span>
                <h3 className="text-sm font-semibold">{t}</h3>
              </div>
              <p className="text-sm leading-relaxed text-pf-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 02 · Skills & Journey (2-Column Editorial Split) */}
      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-14 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="font-mono text-xs text-pf-muted">02 / Competências</span>
            <h2 className="mt-1 font-display text-xl font-semibold">Habilidades essenciais</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.skills.map((s, i) => (
                <span key={i} className="rounded-md border border-pf-line bg-pf-card px-3 py-1.5 font-mono text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {p.journey.length > 0 && (
            <div>
              <span className="font-mono text-xs text-pf-muted">03 / Trajetória</span>
              <h2 className="mt-1 font-display text-xl font-semibold">Marcos e evolução</h2>
              <ol className="mt-5 space-y-4 border-l border-pf-line pl-5">
                {p.journey.map((j, i) => (
                  <li key={i} className="relative text-sm leading-relaxed text-pf-muted">
                    <span className="absolute -left-[24px] top-2 h-1.5 w-1.5 rounded-full bg-pf-fg" />
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
        <p className="mt-3 max-w-2xl font-serif-editorial text-2xl leading-snug md:text-3xl">{p.goal}</p>
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
          className="inline-flex items-center gap-2 rounded-full border border-pf-line bg-pf-card px-4 py-2 text-sm font-medium transition hover:bg-pf-accent hover:text-pf-accent-fg">
          <Icon className="h-4 w-4" /> {label}
        </a>
      ))}
    </div>
  );
}
