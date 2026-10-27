import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe, Presentation, Rocket, Plus, X, Loader2, Pencil, Eye } from "lucide-react";
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
import { DRAFT_KEY, THEMES, slugify, type Draft, type Portfolio } from "@/lib/portfolio";

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

  useEffect(() => {
    const s = localStorage.getItem(DRAFT_KEY);
    if (s) try { setDraft(JSON.parse(s)); } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft]);

  if (!loaded) return null;
  if (!draft) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-bold">Nenhum portfólio em andamento</h1>
        <Button asChild><Link to="/criar">Criar meu portfólio</Link></Button>
      </div>
    );
  }

  const p = draft.portfolio;
  const upd = (patch: Partial<Portfolio>) => setDraft({ ...draft, portfolio: { ...p, ...patch } });
  const txt = (k: TextKey, label: string, rows = 0) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {rows ? <Textarea rows={rows} value={p[k]} onChange={(e) => upd({ [k]: e.target.value })} />
        : <Input value={p[k]} onChange={(e) => upd({ [k]: e.target.value })} />}
    </div>
  );

  async function publish() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAuthOpen(true); return; }
    setPublishing(true);
    try {
      const d = draft!;
      let slug = d.slug;
      if (slug) {
        const { error } = await supabase.from("portfolios").update({ data: d.portfolio as never, theme: d.theme, updated_at: new Date().toISOString() }).eq("slug", slug);
        if (error) throw error;
      } else {
        slug = `${slugify(d.portfolio.name)}-${Math.random().toString(36).slice(2, 6)}`;
        const { error } = await supabase.from("portfolios").insert({ user_id: user.id, slug, theme: d.theme, data: d.portfolio as never });
        if (error) throw error;
        setDraft({ ...d, slug });
      }
      setShareUrl(`${window.location.origin}/p/${slug}`);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível publicar. Tente novamente.");
    } finally {
      setPublishing(false);
    }
  }

  const form = (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="font-display text-lg font-bold">Perfil</h3>
        {txt("name", "Nome")}
        {txt("role", "Área / curso")}
        {txt("headline", "Headline")}
        {txt("bio", "Bio", 4)}
      </section>
      <section className="space-y-4">
        <h3 className="font-display text-lg font-bold">Projeto estrela</h3>
        {txt("projectTitle", "Título do projeto")}
        {txt("challenge", "Desafio", 3)}
        {txt("action", "O que fiz", 3)}
        {txt("result", "Resultado", 3)}
        <ListEditor label="Métricas em destaque" items={p.metrics} onChange={(metrics) => upd({ metrics })} max={4} />
      </section>
      <section className="space-y-4">
        <h3 className="font-display text-lg font-bold">Habilidades e trajetória</h3>
        <ListEditor label="Habilidades" items={p.skills} onChange={(skills) => upd({ skills })} />
        <ListEditor label="Trajetória" items={p.journey} onChange={(journey) => upd({ journey })} max={5} />
      </section>
      <section className="space-y-4">
        <h3 className="font-display text-lg font-bold">Objetivo e contato</h3>
        {txt("goal", "Objetivo profissional", 3)}
        {txt("linkedin", "LinkedIn")}
        {txt("github", "GitHub")}
        {txt("email", "E-mail")}
      </section>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex rounded-full border border-border bg-card p-1">
        <button onClick={() => setView("site")} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${view === "site" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          <Globe className="h-4 w-4" /> Site do Portfólio
        </button>
        <button onClick={() => setView("deck")} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${view === "deck" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          <Presentation className="h-4 w-4" /> Pitch Deck (5 Slides)
        </button>
      </div>
      <div className="inline-flex rounded-full border border-border bg-card p-1">
        {THEMES.map((t) => (
          <button key={t.id} onClick={() => setDraft({ ...draft, theme: t.id })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${draft.theme === t.id ? "bg-foreground text-background" : "text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  const preview = (
    <div className="space-y-4">
      {toolbar}
      {view === "site" ? (
        <div className="overflow-hidden rounded-2xl border border-border shadow-xl"><PortfolioSite p={p} theme={draft.theme} /></div>
      ) : (
        <PitchDeck p={p} theme={draft.theme} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <Button onClick={publish} disabled={publishing} className="rounded-full">
            {publishing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Rocket className="mr-1 h-4 w-4" />}
            {draft.slug ? "Atualizar publicação" : "Publicar portfólio"}
          </Button>
        </div>
      </header>

      {/* Desktop split */}
      <div className="mx-auto hidden max-w-[1400px] gap-6 px-6 py-6 lg:grid lg:grid-cols-[380px_1fr]">
        <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border bg-card p-6">{form}</aside>
        <main>{preview}</main>
      </div>

      {/* Mobile tabs */}
      <div className="px-4 py-4 lg:hidden">
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview"><Eye className="mr-1 h-4 w-4" /> Prévia</TabsTrigger>
            <TabsTrigger value="edit"><Pencil className="mr-1 h-4 w-4" /> Editar</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">{preview}</TabsContent>
          <TabsContent value="edit" className="mt-4 rounded-2xl border border-border bg-card p-5">{form}</TabsContent>
        </Tabs>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => { setAuthOpen(false); publish(); }} />
      <ShareDialog open={!!shareUrl} onOpenChange={(o) => !o && setShareUrl(null)} url={shareUrl ?? ""} name={p.name} />
    </div>
  );
}
