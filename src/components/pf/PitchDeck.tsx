import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { resolveLayoutStyle, type Portfolio, type ThemeName } from "@/lib/portfolio";
import { DECK_SLIDES_METADATA, type FiveSlideDeck } from "@/types/pitchfolio";
import { ContactLinks } from "./PortfolioSite";

const SHORT_LABELS = ["Identidade", "Método STAR", "Habilidades", "Impacto", "Contato"];

function Frame({ n, isFullscreen, onToggleFullscreen, children }: { n: number; isFullscreen?: boolean; onToggleFullscreen?: () => void; children: ReactNode }) {
  const info = DECK_SLIDES_METADATA[n] ?? { title: `Slide ${n + 1}`, subtitle: "" };
  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-10">
      <div className="flex items-center justify-between border-b border-pf-line pb-3 text-xs text-pf-muted">
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-pf-accent px-2 py-0.5 font-mono text-[11px] font-bold text-pf-accent-fg">
            0{n + 1} / 05
          </span>
          <span className="font-semibold text-pf-fg">{info.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {info.subtitle ? (
            <span className="hidden text-xs text-pf-muted md:inline">{info.subtitle}</span>
          ) : null}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Sair da tela cheia" : "Apresentar em tela cheia"}
              title={isFullscreen ? "Sair da tela cheia (Esc)" : "Tela cheia (F)"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-pf-line bg-pf-card text-pf-muted transition hover:text-pf-fg print:hidden"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
      <div key={n} className="my-auto py-4 animate-in fade-in slide-in-from-bottom-2 duration-200">{children}</div>
    </div>
  );
}

export function PitchDeck({ p, deck, theme }: { p: Portfolio; deck?: FiveSlideDeck | undefined; theme: ThemeName }) {
  const [i, setI] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touch = useRef<number | null>(null);
  const next = useCallback(() => setI((x) => Math.min(4, x + 1)), []);
  const prev = useCallback(() => setI((x) => Math.max(0, x - 1)), []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const s1 = deck?.slide_1_who_i_am ?? { name: p.name, role: p.role, headline: p.headline, bio: p.bio };
  const s2 = deck?.slide_2_what_i_did ?? { challenge: p.challenge, action: p.action, result: p.result };
  const s3 = deck?.slide_3_skills ?? { skills: p.skills };
  const s4 = deck?.slide_4_highlight ?? { title: p.projectTitle, metrics: p.metrics, journey: p.journey };
  const s5 = deck?.slide_5_contact ?? { goal: p.goal, email: p.email, linkedin: p.linkedin, github: p.github };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && ["INPUT", "TEXTAREA"].includes(t.tagName)) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey) toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleFullscreen]);

  const accentClass = p.accentColor ? `pf-accent-${p.accentColor}` : "";
  const layout = resolveLayoutStyle(theme, p.layoutStyle);

  const slides = [
    <Frame n={0} key={0} isFullscreen={isFs} onToggleFullscreen={toggleFullscreen}>
      {layout === "split" ? (
        <div className="grid items-center gap-6 sm:grid-cols-[0.85fr_1.15fr] sm:divide-x sm:divide-pf-line">
          <div className="sm:pr-6">
            <span className="inline-block rounded bg-pf-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-pf-accent-fg">
              {s1.role}
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.06] tracking-tight sm:text-4xl">{s1.name}</h2>
          </div>
          <div className="space-y-3 sm:pl-6">
            {s1.headline && s1.headline !== s1.role && (
              <p className="font-display text-lg font-semibold text-pf-fg">{s1.headline}</p>
            )}
            <p className="text-sm leading-relaxed text-pf-muted sm:text-base">{s1.bio}</p>
          </div>
        </div>
      ) : layout === "indice" ? (
        <div className="grid gap-4 border-l-2 border-pf-accent pl-5 sm:grid-cols-[180px_1fr]">
          <div>
            <span className="font-mono text-xs font-bold text-pf-accent">01 / PERFIL</span>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-pf-muted">{s1.role}</p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{s1.name}</h2>
            {s1.headline && s1.headline !== s1.role && (
              <p className="mt-2 font-display text-base font-semibold text-pf-fg">{s1.headline}</p>
            )}
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-pf-muted">{s1.bio}</p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-pf-muted sm:text-sm">{s1.role}</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl">{s1.name}</h2>
          {s1.headline && s1.headline !== s1.role && (
            <p className="mt-3 max-w-xl font-display text-lg font-semibold text-pf-fg sm:text-xl">{s1.headline}</p>
          )}
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-pf-muted sm:text-base">{s1.bio}</p>
        </div>
      )}
    </Frame>,
    <Frame n={1} key={1} isFullscreen={isFs} onToggleFullscreen={toggleFullscreen}>
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{s4.title || "Projeto de maior impacto"}</h2>
      {layout === "indice" ? (
        <div className="mt-5 divide-y divide-pf-line border-t border-pf-line">
          {[
            ["01 · Desafio", s2.challenge],
            ["02 · Ação na prática", s2.action],
            ["03 · Resultado", s2.result],
          ].map(([title, value]) => (
            <div key={title} className="grid gap-2 py-3 sm:grid-cols-[160px_1fr]">
              <span className="text-xs font-bold uppercase tracking-wider text-pf-accent">{title}</span>
              <p className="text-xs leading-relaxed text-pf-fg sm:text-sm">{value}</p>
            </div>
          ))}
        </div>
      ) : layout === "split" ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.15fr]">
          <div className="space-y-3">
            <div className="rounded-lg border border-pf-line bg-pf-card p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pf-muted">01 · Desafio</span>
              <p className="mt-1 text-xs leading-relaxed text-pf-fg">{s2.challenge}</p>
            </div>
            <div className="rounded-lg border border-pf-line bg-pf-card p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pf-muted">02 · Ação</span>
              <p className="mt-1 text-xs leading-relaxed text-pf-fg">{s2.action}</p>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-lg border-l-4 border-pf-accent bg-pf-card p-5">
            <span className="w-fit rounded bg-pf-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-pf-accent-fg">
              03 · Resultado & Impacto
            </span>
            <p className="mt-3 font-display text-base font-semibold leading-snug text-pf-fg sm:text-lg">{s2.result}</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-3.5 sm:grid-cols-3">
          {[
            ["01", "Desafio", s2.challenge],
            ["02", "Ação na prática", s2.action],
            ["03", "Resultado", s2.result],
          ].map(([num, title, value]) => (
            <div key={num} className="rounded-lg border border-pf-line bg-pf-card p-4">
              <span className="inline-block rounded bg-pf-accent/20 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-pf-fg">{num}</span>
              <p className="mt-2 text-sm font-semibold">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-pf-muted sm:text-sm">{value}</p>
            </div>
          ))}
        </div>
      )}
    </Frame>,
    <Frame n={2} key={2} isFullscreen={isFs} onToggleFullscreen={toggleFullscreen}>
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Competências que trago para o time</h2>
      {layout === "indice" ? (
        <div className="mt-6 grid grid-cols-2 gap-y-4 border-t border-pf-line pt-5 sm:grid-cols-3">
          {s3.skills.map((s, k) => (
            <div key={k} className="border-l-2 border-pf-accent pl-3">
              <span className="block font-mono text-[11px] text-pf-muted">0{k + 1}</span>
              <span className="text-sm font-bold text-pf-fg">{s}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {s3.skills.map((s, k) => (
            <div key={k} className="rounded-lg border border-pf-line bg-pf-card px-4 py-3 text-sm font-semibold">
              <span className="mb-1 block font-mono text-[11px] text-pf-muted">0{k + 1}</span>
              {s}
            </div>
          ))}
        </div>
      )}
    </Frame>,
    <Frame n={3} key={3} isFullscreen={isFs} onToggleFullscreen={toggleFullscreen}>
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{s4.title || "Destaques e trajetória"}</h2>
      {s4.metrics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {s4.metrics.map((m, k) => (
            <span key={k} className="rounded-md bg-pf-accent px-3 py-1 text-xs font-bold text-pf-accent-fg">{m}</span>
          ))}
        </div>
      )}
      <ol className="mt-6 space-y-3 border-l-2 border-pf-line pl-5">
        {s4.journey.map((j, k) => (
          <li key={k} className="relative text-sm leading-relaxed sm:text-base">
            <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-pf-accent" />
            {j}
          </li>
        ))}
      </ol>
    </Frame>,
    <Frame n={4} key={4} isFullscreen={isFs} onToggleFullscreen={toggleFullscreen}>
      <p className="text-xs font-semibold uppercase tracking-wider text-pf-muted">Próximo passo & Contato</p>
      <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">{s5.goal}</h2>
      <ContactLinks p={{ ...p, ...s5 }} className="mt-8" />
    </Frame>,
  ];

  return (
    <div className={`theme-${theme} ${accentClass}`}>
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden border border-pf-line bg-pf-bg text-pf-fg shadow-xl print:hidden ${
          isFs ? "flex h-screen items-center justify-center rounded-none border-0" : "aspect-video rounded-xl"
        }`}
        onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = (e.changedTouches[0]?.clientX ?? touch.current) - touch.current;
          if (dx < -40) next();
          if (dx > 40) prev();
          touch.current = null;
        }}
      >
        <div className="absolute inset-0 overflow-auto">{slides[i]}</div>
        <div className="absolute bottom-0 left-0 h-1 bg-pf-accent transition-all duration-300" style={{ width: `${((i + 1) / 5) * 100}%` }} />
      </div>
      <div className="hidden space-y-6 print:block">
        {slides.map((s, idx) => (
          <div key={idx} className="aspect-video w-full break-inside-avoid overflow-hidden rounded-xl border border-pf-line bg-pf-bg text-pf-fg">
            {s}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <button onClick={prev} disabled={i === 0} aria-label="Slide anterior"
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-primary/50 disabled:opacity-40 sm:text-sm">
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {DECK_SLIDES_METADATA.map((info, k) => (
            <button
              key={info.title}
              onClick={() => setI(k)}
              aria-label={info.title}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                k === i ? "bg-primary text-primary-foreground shadow-xs" : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="font-mono text-[10px]">0{k + 1}</span>
              <span className="hidden sm:inline">{SHORT_LABELS[k]}</span>
            </button>
          ))}
        </div>
        <button onClick={next} disabled={i === 4} aria-label="Próximo slide"
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold transition hover:border-primary/50 disabled:opacity-40 sm:text-sm">
          Próximo <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground print:hidden">Use as setas ← → para navegar ou F para tela cheia</p>
    </div>
  );
}
