import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, Mail, Presentation, Printer } from "lucide-react";
import { getPublicPortfolio } from "@/lib/public.functions";
import { normalizeUrl } from "@/lib/portfolio";
import { PortfolioSite } from "@/components/pf/PortfolioSite";
import { PitchDeck } from "@/components/pf/PitchDeck";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const r = await getPublicPortfolio({ data: { slug: params.slug } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.portfolio;
    const title = p ? `${p.name} — ${p.role} | PitchFolio` : "Portfólio indisponível | PitchFolio";
    const desc = p?.headline ?? "Portfólio profissional criado com PitchFolio.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
        ...(p ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold">Portfólio não encontrado</h1>
      <Link to="/" className="text-primary underline">Criar o meu no PitchFolio</Link>
    </div>
  ),
  component: PublicPage,
});

function PublicPage() {
  const { portfolio, theme, deck, sections } = Route.useLoaderData();
  const [view, setView] = useState<"site" | "deck">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "deck" ? "deck" : "site"
  );
  const accentClass = portfolio.accentColor ? `pf-accent-${portfolio.accentColor}` : "";
  const contactHref = portfolio.email
    ? `mailto:${portfolio.email}`
    : portfolio.linkedin
      ? normalizeUrl(portfolio.linkedin)
      : "";
  return (
    <div className={`theme-${theme} ${accentClass} min-h-screen bg-pf-bg`}>
      <div className="sticky top-0 z-10 flex justify-center py-3 print:hidden">
        <div className="inline-flex items-center gap-0.5 rounded-lg border border-pf-line bg-pf-card p-1 text-pf-fg shadow-sm">
          <button onClick={() => setView("site")} className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${view === "site" ? "bg-pf-accent text-pf-accent-fg shadow-xs" : "text-pf-muted hover:text-pf-fg"}`}><Globe className="h-4 w-4" /> Portfólio</button>
          <button onClick={() => setView("deck")} className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${view === "deck" ? "bg-pf-accent text-pf-accent-fg shadow-xs" : "text-pf-muted hover:text-pf-fg"}`}><Presentation className="h-4 w-4" /> Pitch</button>
          <button onClick={() => window.print()} aria-label="Imprimir ou exportar PDF" className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium text-pf-muted transition hover:text-pf-fg"><Printer className="h-4 w-4" /> PDF</button>
          {contactHref && (
            <a
              href={contactHref}
              target={contactHref.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-pf-line bg-pf-bg px-3 py-1.5 text-xs font-semibold text-pf-fg transition hover:border-pf-accent hover:text-pf-accent"
            >
              <Mail className="h-3.5 w-3.5" /> Contatar
            </a>
          )}
        </div>
      </div>
      {view === "site" ? (
        <PortfolioSite p={portfolio} theme={theme} sections={sections} />
      ) : (
        <div className="mx-auto max-w-5xl px-4 py-8"><PitchDeck p={portfolio} deck={deck} theme={theme} /></div>
      )}
      <p className="py-6 text-center text-xs text-pf-muted">
        Feito com <Link to="/" className="underline">PitchFolio</Link>
      </p>
    </div>
  );
}
