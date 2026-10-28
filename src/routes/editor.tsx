import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listOwnedPortfolios, publishPortfolioDraft } from "@/controllers/portfolios.functions";
import { createDeck, draftSchema, portfolioSchema, themeSchema } from "@/validators/portfolio";
import { Globe, Presentation, Rocket, Plus, X, Loader2, Pencil, Eye, Printer, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/pf/Logo";
import { PortfolioSite } from "@/components/pf/PortfolioSite";
import { PitchDeck } from "@/components/pf/PitchDeck";
import { AuthDialog, ShareDialog } from "@/components/pf/PublishDialogs";
import { DEMO_ANSWERS, DRAFT_KEY, THEMES, localStructure, type Draft, type Portfolio } from "@/lib/portfolio";

export const Route = createFileRoute("/editor")({
  head: () => ({
    meta: [
      { title: "Editor e prévia — PitchFolio" },
      { name: "description", content: "Revise, edite e publique seu portfólio e pitch deck." },
      { property: "og:title", content: "Editor — PitchFolio" },
      { property: "og:description", content: "Revise e publique seu portfólio e pitch deck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Editor,
});

type TextKey = Exclude<keyof Portfolio, "metrics" | "skills" | "journey">;

const THEME_SWATCHES: Record<string, { bg: string; accent: string }> = {
  moderno: { bg: "#191e36", accent: "#4be3d6" },
  quente: { bg: "#f6eee0", accent: "#d1542a" },
  minimal: { bg: "#ffffff", accent: "#3b5bdb" },
};

function ListEditor({ label, items, onChange, max = 6 }: { label: string; items: string[]; onChange: (v: string[]) => void; max?: number }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input value={it} onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))} />
          <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="Remover"><X className="h-4 w-4" /></Button>
        </div>
      ))}
      {items.length < max && (
        <Button size="sm" variant="outline" onClick={() => onChange([...items, ""])}><Plus className="mr-1 h-3 w-3" /> Adicionar</Button>
      )}
    </div>
  );
}

function Editor() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<"site" | "deck">("site");
  const [authOpen, setAuthOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const publishDraft = useServerFn(publishPortfolioDraft);
  const fetchOwned = useServerFn(listOwnedPortfolios);

  async function loadRemotePortfolio() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      const rows = await fetchOwned();
      const first = rows?.[0];
      if (!first) return false;
      const pParsed = portfolioSchema.safeParse(first.data);
      const tParsed = themeSchema.safeParse(first.selected_theme);
      if (pParsed.success) {
        setDraft({
          portfolio: pParsed.data,
          deck: createDeck(pParsed.data),
          theme: tParsed.success ? tParsed.data : "moderno",
          ...(first.slug ? { slug: first.slug } : {}),
        });
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  useEffect(() => {
    (async () => {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("view") === "deck") setView("deck");
      if (sp.get("modal") === "auth") setAuthOpen(true);
      if (sp.get("modal") === "share") setShareUrl(`${window.location.origin}/p/ana-souza-demo`);
      if (sp.get("empty") === "1") {
        setLoaded(true);
        return;
      }
      const themeOverride = themeSchema.safeParse(sp.get("theme"));
      const s = localStorage.getItem(DRAFT_KEY);
      if (s) {
        try {
          const valid = draftSchema.safeParse(JSON.parse(s));
          if (valid.success) {
            setDraft({
              portfolio: valid.data.portfolio,
              deck: valid.data.deck ?? createDeck(valid.data.portfolio),
              theme: themeOverride.success ? themeOverride.data : valid.data.theme,
              ...(valid.data.slug ? { slug: valid.data.slug } : {}),
            });
            setLoaded(true);
            return;
          }
        } catch { /* invalid browser draft */ }
      }
      await loadRemotePortfolio();
      setLoaded(true);
    })();
  }, []);
  useEffect(() => { if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft]);

  if (!loaded) return null;
  if (!draft) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-bold">Nenhum portfólio em andamento</h1>
        <p className="max-w-md text-muted-foreground">Crie um novo portfólio em 3 passos, carregue um exemplo de demonstração ou entre na sua conta.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/criar">Criar meu portfólio</Link></Button>
          <Button variant="secondary" onClick={() => {
            const demoP = localStructure(DEMO_ANSWERS);
            setDraft({ portfolio: demoP, deck: createDeck(demoP), theme: "moderno" });
          }}>
            Carregar exemplo (Demo)
          </Button>
          <Button variant="outline" onClick={() => setAuthOpen(true)}>
            <LogIn className="mr-1.5 h-4 w-4" /> Entrar na minha conta
          </Button>
        </div>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onAuthed={async () => {
          setAuthOpen(false);
          const ok = await loadRemotePortfolio();
          if (!ok) toast.message("Conta conectada! Crie ou carregue um portfólio para publicar.");
        }} />
      </div>
    );
  }

  const p = draft.portfolio;
  const upd = (patch: Partial<Portfolio>) => {
    const nextP = { ...p, ...patch };
    setDraft({ ...draft, portfolio: nextP, deck: createDeck(nextP) });
  };
  const txt = (k: TextKey, label: string, rows = 0) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {rows ? <Textarea rows={rows} value={p[k]} onChange={(e) => upd({ [k]: e.target.value })} />
        : <Input value={p[k]} onChange={(e) => upd({ [k]: e.target.value })} />}
    </div>
  );

  async function publish() {
    if (!draft || publishing) return;
    const cleaned: Draft = {
      ...draft,
      portfolio: {
        ...draft.portfolio,
        metrics: draft.portfolio.metrics.map((x) => x.trim()).filter(Boolean),
        skills: draft.portfolio.skills.map((x) => x.trim()).filter(Boolean),
        journey: draft.portfolio.journey.map((x) => x.trim()).filter(Boolean),
      },
    };
    const check = draftSchema.safeParse(cleaned);
    if (!check.success) {
      const issue = check.error.issues[0];
      toast.error(issue?.message ?? "Verifique os campos preenchidos antes de publicar.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAuthOpen(true); return; }
    setPublishing(true);
    try {
      const saved = await publishDraft({ data: check.data });
      setDraft({ ...cleaned, slug: saved.slug });
      setShareUrl(`${window.location.origin}${saved.path}`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error && e.message ? e.message : "Não foi possível publicar. Tente novamente.");
    } finally {
      setPublishing(false);
    }
  }

  const form = (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-border bg-background/60 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <span className="font-mono text-xs font-bold text-primary">01</span>
          <h3 className="font-display text-base font-bold">Identidade & Posicionamento</h3>
        </div>
        {txt("name", "Nome")}
        {txt("role", "Área / curso")}
        {txt("headline", "Headline")}
        {txt("bio", "Bio", 4)}
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-background/60 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <span className="font-mono text-xs font-bold text-primary">02</span>
          <h3 className="font-display text-base font-bold">Projeto Estrela (Método STAR)</h3>
        </div>
        {txt("projectTitle", "Título do projeto")}
        {txt("challenge", "Desafio", 3)}
        {txt("action", "O que fiz", 3)}
        {txt("result", "Resultado", 3)}
        <ListEditor label="Métricas em destaque" items={p.metrics} onChange={(metrics) => upd({ metrics })} max={4} />
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-background/60 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <span className="font-mono text-xs font-bold text-primary">03</span>
          <h3 className="font-display text-base font-bold">Habilidades & Trajetória</h3>
        </div>
        <ListEditor label="Habilidades" items={p.skills} onChange={(skills) => upd({ skills })} />
        <ListEditor label="Trajetória" items={p.journey} onChange={(journey) => upd({ journey })} max={5} />
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-background/60 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <span className="font-mono text-xs font-bold text-primary">04</span>
          <h3 className="font-display text-base font-bold">Objetivo & Contato</h3>
        </div>
        {txt("goal", "Objetivo profissional", 3)}
        {txt("linkedin", "LinkedIn")}
        {txt("github", "GitHub")}
        {txt("email", "E-mail")}
      </section>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div className="inline-flex rounded-lg border border-border bg-card p-1 shadow-xs">
        <button onClick={() => setView("site")} className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${view === "site" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}>
          <Globe className="h-4 w-4" /> Site do Portfólio
        </button>
        <button onClick={() => setView("deck")} className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition ${view === "deck" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}>
          <Presentation className="h-4 w-4" /> Pitch Deck (5 Slides)
        </button>
      </div>
      <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-xs">
        {THEMES.map((t) => {
          const sw = THEME_SWATCHES[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setDraft({ ...draft, theme: t.id })}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${draft.theme === t.id ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
            >
              {sw && (
                <span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border/60" style={{ backgroundColor: sw.bg }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sw.accent }} />
                </span>
              )}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const preview = (
    <div className="space-y-4">
      {toolbar}
      {view === "site" ? (
        <div className="overflow-hidden rounded-xl border border-border shadow-lg"><PortfolioSite p={p} theme={draft.theme} /></div>
      ) : (
        <PitchDeck p={p} deck={draft.deck} theme={draft.theme} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-lg">
              <Printer className="mr-1.5 h-4 w-4" /> Exportar PDF
            </Button>
            <Button onClick={publish} disabled={publishing} className="rounded-lg">
              {publishing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Rocket className="mr-1 h-4 w-4" />}
              {draft.slug ? "Atualizar publicação" : "Publicar portfólio"}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop split */}
      <div className="mx-auto hidden max-w-[1400px] gap-6 px-6 py-6 lg:grid lg:grid-cols-[380px_1fr] print:block print:max-w-none print:p-0">
        <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-border bg-card p-5 print:hidden">{form}</aside>
        <main>{preview}</main>
      </div>

      {/* Mobile tabs */}
      <div className="px-4 py-4 lg:hidden print:hidden">
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview"><Eye className="mr-1 h-4 w-4" /> Prévia</TabsTrigger>
            <TabsTrigger value="edit"><Pencil className="mr-1 h-4 w-4" /> Editar</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">{preview}</TabsContent>
          <TabsContent value="edit" className="mt-4 rounded-xl border border-border bg-card p-5">{form}</TabsContent>
        </Tabs>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => { setAuthOpen(false); publish(); }} />
      <ShareDialog open={!!shareUrl} onOpenChange={(o) => !o && setShareUrl(null)} url={shareUrl ?? ""} name={p.name} />
    </div>
  );
}
