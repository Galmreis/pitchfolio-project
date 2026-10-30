import type { ReactNode } from "react";
import { accentProps, normalizeUrl, type Portfolio, type ThemeName } from "@/lib/portfolio";
import type { PortfolioSections } from "@/services/portfolioSections.service";

const stripProtocol = (u: string) => u.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

function formatPeriod(start: string | null, end: string | null, current: boolean): string {
  const fmt = (d: string | null) => {
    if (!d) return "";
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" });
  };
  const from = fmt(start);
  const to = current ? "atual" : fmt(end);
  return [from, to].filter(Boolean).join(" – ");
}

function SideBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pf-resume-avoid">
      <h3 className="pf-resume-side-title">{title}</h3>
      {children}
    </section>
  );
}

function MainBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pf-resume-block">
      <h2 className="pf-resume-main-title">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Print-only résumé (A4) shown instead of the on-screen site when exporting PDF.
 * Always dark text on white so it stays legible whatever the screen theme; the
 * portfolio accent colors the sidebar and headings, and the STAR case stays the
 * centerpiece so the PDF still reads as the portfolio, not a plain CV.
 */
export function PrintResume({ p, theme, sections }: { p: Portfolio; theme: ThemeName; sections?: PortfolioSections | undefined }) {
  const accent = accentProps(p.accentColor);
  const initials = p.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const isGithub = /github\.com/i.test(p.github);
  const contacts = [
    p.email && { label: "E-mail", text: p.email, href: `mailto:${p.email}` },
    p.linkedin && { label: "LinkedIn", text: stripProtocol(p.linkedin), href: normalizeUrl(p.linkedin) },
    p.github && { label: isGithub ? "GitHub" : "Portfólio / Site", text: stripProtocol(p.github), href: normalizeUrl(p.github) },
  ].filter(Boolean) as { label: string; text: string; href: string }[];
  const skills = [...new Set([...p.skills, ...(sections?.skills.map((s) => s.name) ?? [])].map((s) => s.trim()).filter(Boolean))];
  const timeline = sections?.timeline ?? [];
  const projects = (sections?.projects ?? []).filter((pr) => pr.name.trim());
  const certifications = sections?.certifications ?? [];
  const star = [
    ["Contexto & Desafio", p.challenge],
    ["Execução na prática", p.action],
    ["Resultados & Impacto", p.result],
  ].filter(([, v]) => v?.trim());

  return (
    <div className={`theme-${theme} ${accent.className} pf-resume hidden print:grid`} style={accent.style}>
      <div className="pf-resume-side-bg" aria-hidden />
      <aside className="pf-resume-side">
        {p.avatarUrl ? (
          <img src={p.avatarUrl} alt={p.name || "Foto de perfil"} className="pf-resume-photo" />
        ) : (
          <div className="pf-resume-photo pf-resume-initials">{initials || "PF"}</div>
        )}

        {contacts.length > 0 && (
          <SideBlock title="Contato">
            <ul className="space-y-2">
              {contacts.map((c) => (
                <li key={c.label}>
                  <span className="pf-resume-side-label">{c.label}</span>
                  {/* <wbr> lets long URLs wrap at "/" instead of mid-word. */}
                  <a href={c.href} className="block [overflow-wrap:anywhere]">
                    {c.text.split("/").map((part, i) => (i === 0 ? part : <span key={i}>/<wbr />{part}</span>))}
                  </a>
                </li>
              ))}
            </ul>
          </SideBlock>
        )}

        {skills.length > 0 && (
          <SideBlock title="Competências">
            <ul className="space-y-1">
              {skills.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </SideBlock>
        )}

        {p.metrics.length > 0 && (
          <SideBlock title="Destaques">
            <ul className="space-y-1.5">
              {p.metrics.map((m, i) => <li key={i} className="pf-resume-metric">{m}</li>)}
            </ul>
          </SideBlock>
        )}

        {certifications.length > 0 && (
          <SideBlock title="Certificações">
            <ul className="space-y-2">
              {certifications.map((c) => (
                <li key={c.id}>
                  {c.title}
                  {(c.issuer || c.issue_date) && (
                    <span className="pf-resume-side-label">{[c.issuer, formatPeriod(c.issue_date, null, false)].filter(Boolean).join(" · ")}</span>
                  )}
                </li>
              ))}
            </ul>
          </SideBlock>
        )}
      </aside>

      <main className="pf-resume-main">
        <header className="pf-resume-block">
          <h1 className="pf-resume-name">{p.name || "Seu nome"}</h1>
          {p.role && <p className="pf-resume-role">{p.role}</p>}
          {p.headline && p.headline !== p.role && <p className="pf-resume-headline">{p.headline}</p>}
        </header>

        {p.bio && (
          <MainBlock title="Resumo">
            <p>{p.bio}</p>
          </MainBlock>
        )}

        {star.length > 0 && (
          <MainBlock title="Projeto em destaque · Método STAR">
            <div className="pf-resume-avoid">
              <h3 className="pf-resume-item-title">{p.projectTitle || "Projeto de maior impacto"}</h3>
              <div className="mt-2 space-y-2.5">
                {star.map(([label, value]) => (
                  <div key={label} className="pf-resume-star">
                    <span className="pf-resume-kicker">{label}</span>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </MainBlock>
        )}

        {(timeline.length > 0 || p.journey.length > 0) && (
          <MainBlock title="Trajetória">
            {timeline.length > 0 ? (
              <div className="space-y-3">
                {timeline.map((t) => (
                  <div key={t.id} className="pf-resume-avoid">
                    <h3 className="pf-resume-item-title">{t.organization || t.role}</h3>
                    {t.organization && t.role && <p>{t.role}</p>}
                    {(t.start_date || t.is_current) && <p className="pf-resume-meta">{formatPeriod(t.start_date, t.end_date, t.is_current)}</p>}
                    {t.description && <p className="mt-1">{t.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <ul className="pf-resume-list">
                {p.journey.map((j, i) => <li key={i}>{j}</li>)}
              </ul>
            )}
          </MainBlock>
        )}

        {projects.length > 0 && (
          <MainBlock title="Outros projetos">
            <div className="space-y-3">
              {projects.map((pr) => (
                <div key={pr.id} className="pf-resume-avoid">
                  <h3 className="pf-resume-item-title">{pr.name}</h3>
                  {pr.description && <p>{pr.description}</p>}
                  {pr.technologies.length > 0 && <p className="pf-resume-meta">{pr.technologies.join(" · ")}</p>}
                </div>
              ))}
            </div>
          </MainBlock>
        )}

        {p.goal && (
          <MainBlock title="Objetivo profissional">
            <p>{p.goal}</p>
          </MainBlock>
        )}
      </main>
    </div>
  );
}
