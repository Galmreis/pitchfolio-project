import { Github, Linkedin, Mail, Target, Wrench, Trophy } from "lucide-react";
import { normalizeUrl, type Portfolio, type ThemeName } from "@/lib/portfolio";

export function PortfolioSite({ p, theme }: { p: Portfolio; theme: ThemeName }) {
  const initials = p.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className={`theme-${theme} bg-pf-bg text-pf-fg`}>
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-14 md:px-10 md:pt-20">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-pf-accent font-display text-2xl font-bold text-pf-accent-fg">
          {initials || "PF"}
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pf-muted">{p.role}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">{p.name || "Seu nome"}</h1>
        <p className="mt-5 max-w-2xl text-xl text-pf-muted md:text-2xl">{p.headline}</p>
      </section>

      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-12 md:px-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-pf-muted">Sobre mim</h2>
        <p className="max-w-2xl text-lg leading-relaxed">{p.bio}</p>
      </section>

      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-12 md:px-10">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-pf-muted">Projeto em destaque</h2>
        <h3 className="font-display text-3xl font-bold">{p.projectTitle}</h3>
        <div className="mt-6 flex flex-wrap gap-3">
          {p.metrics.map((m, i) => (
            <span key={i} className="rounded-full bg-pf-accent px-4 py-1.5 text-sm font-semibold text-pf-accent-fg">{m}</span>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Target, t: "Desafio", d: p.challenge },
            { icon: Wrench, t: "O que fiz", d: p.action },
            { icon: Trophy, t: "Resultado", d: p.result },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-pf-line bg-pf-card p-5">
              <Icon className="h-5 w-5 text-pf-muted" />
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-pf-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-12 md:px-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-pf-muted">Habilidades</h2>
        <div className="flex flex-wrap gap-2">
          {p.skills.map((s, i) => (
            <span key={i} className="rounded-lg border border-pf-line bg-pf-card px-3 py-1.5 text-sm font-medium">{s}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl border-t border-pf-line px-6 py-12 pb-20 md:px-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-pf-muted">Próximo passo</h2>
        <p className="max-w-2xl font-display text-2xl font-semibold leading-snug">{p.goal}</p>
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
