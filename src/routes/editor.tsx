import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listOwnedPortfolios, publishPortfolioDraft } from "@/controllers/portfolios.functions";
import { createDeck, draftSchema, portfolioSchema, themeSchema } from "@/validators/portfolio";
import { Globe, Presentation, Rocket, Plus, X, Loader2, Pencil, Eye, Printer, LogIn, ArrowUp, ArrowDown, Upload, SlidersHorizontal, RotateCcw, QrCode } from "lucide-react";
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
import { ACCENT_COLORS, AVATAR_PRESETS, DEMO_PERSONAS, DRAFT_KEY, LAYOUT_STYLES, PROJECT_IMAGE_PRESETS, THEMES, buildPersonaPortfolio, resolveLayoutStyle, type Draft, type Portfolio } from "@/lib/portfolio";

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

type TextKey = Exclude<keyof Portfolio, "metrics" | "skills" | "journey" | "accentColor" | "sectionOrder" | "layoutStyle" | "avatarUrl" | "projectImageUrl">;

const THEME_SWATCHES: Record<string, { bg: string; accent: string }> = {
  moderno: { bg: "#1c1715", accent: "#e05a2b" },
  quente: { bg: "#f6efe2", accent: "#c84b16" },
  minimal: { bg: "#ffffff", accent: "#9e3610" },
};

function renderAdjustedToDataUrl(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  zoom: number,
  offsetX: number,
  offsetY: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const nw = img.naturalWidth || targetW;
  const nh = img.naturalHeight || targetH;
  const baseScale = Math.max(targetW / nw, targetH / nh);
  const scale = baseScale * zoom;
  const drawW = nw * scale;
  const drawH = nh * scale;
  const panRangeX = Math.max(Math.abs(drawW - targetW) / 2, targetW * 0.4);
  const panRangeY = Math.max(Math.abs(drawH - targetH) / 2, targetH * 0.4);
  const dx = (targetW - drawW) / 2 + (offsetX / 100) * panRangeX;
  const dy = (targetH - drawH) / 2 + (offsetY / 100) * panRangeY;
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(img, dx, dy, drawW, drawH);
  for (const q of [0.8, 0.68, 0.55, 0.42]) {
    const webp = canvas.toDataURL("image/webp", q);
    if (webp.length <= 14000 && webp.startsWith("data:image/webp")) return webp;
    const jpeg = canvas.toDataURL("image/jpeg", q);
    if (jpeg.length <= 14000) return jpeg;
  }
  return canvas.toDataURL("image/jpeg", 0.35);
}

function ImagePickerField({
  label,
  value,
  onChange,
  presets,
  emptyLabel,
  placeholder,
  shape,
}: {
  label: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  presets: readonly { url: string; label: string }[];
  emptyLabel: string;
  placeholder: string;
  shape: "avatar" | "cover";
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const sourceImgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const targetW = shape === "avatar" ? 160 : 480;
  const targetH = shape === "avatar" ? 160 : 270;
  const isDataUrl = !!value?.startsWith("data:image/");

  const applyTransform = (nextZoom: number, nextX: number, nextY: number, imgEl = sourceImgRef.current) => {
    if (!imgEl) return;
    const out = renderAdjustedToDataUrl(imgEl, targetW, targetH, nextZoom, nextX, nextY);
    if (out) onChange(out);
  };

  const loadSourceAndAdjust = (src: string, autoApply: boolean) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      sourceImgRef.current = img;
      setSourceUrl(src);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setAdjustOpen(true);
      if (autoApply) {
        const out = renderAdjustedToDataUrl(img, targetW, targetH, 1, 0, 0);
        if (out) onChange(out);
      }
    };
    img.onerror = () => {
      toast.error("Não foi possível carregar esta imagem para ajuste.");
    };
    img.src = src;
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem (PNG, JPG, WebP ou SVG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        loadSourceAndAdjust(reader.result, true);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 rounded-md px-2.5 text-xs"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3 w-3" /> Enviar arquivo
          </Button>
          {value && (
            <Button
              type="button"
              size="sm"
              variant={adjustOpen ? "secondary" : "ghost"}
              className="h-7 rounded-md px-2 text-xs"
              onClick={() => {
                if (!adjustOpen && (!sourceImgRef.current || sourceUrl !== value)) {
                  loadSourceAndAdjust(sourceUrl ?? value, false);
                } else {
                  setAdjustOpen(!adjustOpen);
                }
              }}
            >
              <SlidersHorizontal className="mr-1 h-3 w-3" /> Ajustar
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((pr) => {
          const active = value === pr.url;
          return (
            <button
              key={pr.url}
              type="button"
              onClick={() => {
                setSourceUrl(pr.url);
                sourceImgRef.current = null;
                setAdjustOpen(false);
                onChange(pr.url);
              }}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {shape === "avatar" && <img src={pr.url} alt={pr.label} className="h-4 w-4 rounded-full object-cover" />}
              {pr.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setAdjustOpen(false);
            setSourceUrl(null);
            sourceImgRef.current = null;
            onChange(undefined);
          }}
          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            !value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          {emptyLabel}
        </button>
      </div>

      {adjustOpen && value && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Ajustar enquadramento (arraste ou use os controles)</span>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffsetX(0);
                setOffsetY(0);
                applyTransform(1, 0, 0);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Resetar
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                dragRef.current = { startX: e.clientX, startY: e.clientY, origX: offsetX, origY: offsetY };
              }}
              onPointerMove={(e) => {
                if (!dragRef.current) return;
                const nextX = Math.max(-100, Math.min(100, Math.round(dragRef.current.origX + (e.clientX - dragRef.current.startX) * 1.4)));
                const nextY = Math.max(-100, Math.min(100, Math.round(dragRef.current.origY + (e.clientY - dragRef.current.startY) * 1.4)));
                setOffsetX(nextX);
                setOffsetY(nextY);
                applyTransform(zoom, nextX, nextY);
              }}
              onPointerUp={() => {
                dragRef.current = null;
              }}
              title="Arraste para reposicionar"
              className={`relative shrink-0 cursor-grab overflow-hidden border border-primary/40 bg-muted/40 select-none active:cursor-grabbing ${
                shape === "avatar" ? "h-16 w-16 rounded-lg" : "aspect-video w-28 rounded-lg"
              }`}
            >
              <img src={value} alt="Prévia do recorte" draggable={false} className="h-full w-full object-cover" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Zoom</span>
                  <span className="font-mono">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={250}
                  step={5}
                  value={Math.round(zoom * 100)}
                  aria-label="Zoom da imagem"
                  onChange={(e) => {
                    const nextZoom = Number(e.target.value) / 100;
                    setZoom(nextZoom);
                    applyTransform(nextZoom, offsetX, offsetY);
                  }}
                  className="h-1.5 w-full cursor-pointer accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Horizontal (X)</span>
                    <span className="font-mono">{offsetX}%</span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={2}
                    value={offsetX}
                    aria-label="Posição horizontal"
                    onChange={(e) => {
                      const nextX = Number(e.target.value);
                      setOffsetX(nextX);
                      applyTransform(zoom, nextX, offsetY);
                    }}
                    className="h-1.5 w-full cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Vertical (Y)</span>
                    <span className="font-mono">{offsetY}%</span>
                  </div>
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    step={2}
                    value={offsetY}
                    aria-label="Posição vertical"
                    onChange={(e) => {
                      const nextY = Number(e.target.value);
                      setOffsetY(nextY);
                      applyTransform(zoom, offsetX, nextY);
                    }}
                    className="h-1.5 w-full cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Input
        value={isDataUrl ? "" : (value ?? "")}
        onChange={(e) => {
          const v = e.target.value || undefined;
          setSourceUrl(v ?? null);
          sourceImgRef.current = null;
          onChange(v);
        }}
        placeholder={isDataUrl ? "Imagem personalizada aplicada (cole um link para substituir)" : placeholder}
        className="text-xs"
      />
    </div>
  );
}

function ListEditor({ label, items, onChange, max = 6 }: { label: string; items: string[]; onChange: (v: string[]) => void; max?: number }) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [picked] = next.splice(from, 1);
    if (picked !== undefined) next.splice(to, 0, picked);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input value={it} onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))} />
          {items.length > 1 && (
            <>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Mover para cima">
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} aria-label="Mover para baixo">
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="Remover"><X className="h-4 w-4" /></Button>
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
        <div className="flex flex-wrap justify-center gap-2.5">
          <Button asChild><Link to="/criar">Criar meu portfólio</Link></Button>
          {DEMO_PERSONAS.map((dp) => (
            <Button
              key={dp.id}
              variant="secondary"
              onClick={() => {
                const demoP = buildPersonaPortfolio(dp);
                setDraft({ portfolio: demoP, deck: createDeck(demoP), theme: dp.theme });
              }}
            >
              Exemplo: {dp.shortLabel}
            </Button>
          ))}
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
        {txt("headline", "Frase de destaque")}
        {txt("bio", "Sobre você (Resumo)", 4)}
        <ImagePickerField
          label="Foto / Ícone de Perfil"
          value={p.avatarUrl}
          onChange={(avatarUrl) => upd({ avatarUrl })}
          presets={AVATAR_PRESETS}
          emptyLabel="Apenas iniciais"
          placeholder="Ou cole o link de uma foto sua (https://…)"
          shape="avatar"
        />
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-background/60 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <span className="font-mono text-xs font-bold text-primary">02</span>
          <h3 className="font-display text-base font-bold">Projeto Estrela (Método STAR)</h3>
        </div>
        {txt("projectTitle", "Título do projeto")}
        <ImagePickerField
          label="Imagem ou Capa do Projeto"
          value={p.projectImageUrl}
          onChange={(projectImageUrl) => upd({ projectImageUrl })}
          presets={PROJECT_IMAGE_PRESETS}
          emptyLabel="Sem capa"
          placeholder="Ou cole o link de uma imagem do projeto (https://…)"
          shape="cover"
        />
        {txt("challenge", "Desafio", 3)}
        {txt("action", "O que fiz", 3)}
        {txt("result", "Resultado", 3)}
        <ListEditor label="Métricas em destaque" items={p.metrics} onChange={(metrics) => upd({ metrics })} max={4} />
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-background/60 p-4">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">03</span>
            <h3 className="font-display text-base font-bold">Habilidades & Trajetória</h3>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Ordem de destaque no portfólio</Label>
          <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => upd({ sectionOrder: "project_first" })}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                (p.sectionOrder ?? "project_first") === "project_first"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Projeto STAR 1º
            </button>
            <button
              type="button"
              onClick={() => upd({ sectionOrder: "journey_first" })}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                p.sectionOrder === "journey_first"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Trajetória 1º
            </button>
          </div>
        </div>
        <ListEditor label="Habilidades (use ↑ ↓ para ordenar)" items={p.skills} onChange={(skills) => upd({ skills })} />
        <ListEditor label="Trajetória / Experiências (use ↑ ↓ para ordenar)" items={p.journey} onChange={(journey) => upd({ journey })} max={5} />
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-background/60 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <span className="font-mono text-xs font-bold text-primary">04</span>
          <h3 className="font-display text-base font-bold">Objetivo & Contato</h3>
        </div>
        {txt("goal", "Objetivo profissional", 3)}
        {txt("linkedin", "LinkedIn")}
        {txt("github", "Site / Portfólio / GitHub")}
        {txt("email", "E-mail")}
      </section>
    </div>
  );

  const activeLayout = resolveLayoutStyle(draft.theme, p.layoutStyle);

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div className="inline-flex rounded-lg border border-border bg-card p-1 shadow-xs">
        <button onClick={() => setView("site")} className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${view === "site" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}>
          <Globe className="h-4 w-4" /> Site do Portfólio
        </button>
        <button onClick={() => setView("deck")} className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${view === "deck" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}>
          <Presentation className="h-4 w-4" /> Pitch Deck (5 Slides)
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-xs" role="group" aria-label="Tema base">
          {THEMES.map((t) => {
            const sw = THEME_SWATCHES[t.id];
            return (
              <button
                key={t.id}
                onClick={() => {
                  const nextP = { ...p, layoutStyle: undefined };
                  setDraft({ ...draft, theme: t.id, portfolio: nextP, deck: createDeck(nextP) });
                }}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${draft.theme === t.id ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
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
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-xs" role="group" aria-label="Variação de layout">
          {LAYOUT_STYLES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => upd({ layoutStyle: l.id })}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                activeLayout === l.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-xs" role="group" aria-label="Cor de destaque">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Cor:</span>
          {ACCENT_COLORS.map((c) => {
            const active = (p.accentColor ?? "laranja") === c.id;
            return (
              <button
                key={c.id}
                type="button"
                title={`Cor de destaque: ${c.label}`}
                aria-label={`Cor de destaque: ${c.label}`}
                onClick={() => upd({ accentColor: c.id })}
                className={`h-5 w-5 rounded-full transition-transform ${
                  active ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card" : "opacity-75 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.swatch }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

  const preview = (
    <div className="space-y-4">
      {toolbar}
      {view === "site" ? (
        <div className="overflow-hidden rounded-xl border border-border shadow-lg duration-300 animate-in fade-in-50"><PortfolioSite p={p} theme={draft.theme} /></div>
      ) : (
        <div className="duration-300 animate-in fade-in-50"><PitchDeck p={p} deck={draft.deck} theme={draft.theme} /></div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link to="/perfil">Meu Perfil</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const fallbackSlug = DEMO_PERSONAS.find((dp) => dp.answers.name === p.name)?.slug ?? "ana-souza-demo";
                setShareUrl(`${window.location.origin}/p/${draft.slug ?? fallbackSlug}`);
              }}
              className="rounded-lg"
            >
              <QrCode className="mr-1.5 h-4 w-4" /> QR Code / Link
            </Button>
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
