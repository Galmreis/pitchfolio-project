import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Portfolio, ThemeName } from "@/lib/portfolio";
import { DECK_SLIDES_METADATA, type FiveSlideDeck } from "@/types/pitchfolio";
import { ContactLinks } from "./PortfolioSite";

function Frame({ n, children }: { n: number; children: ReactNode }) {
  const info = DECK_SLIDES_METADATA[n] ?? { title: `Slide ${n + 1}`, subtitle: "" };
  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-10">
      <div className="flex items-center justify-between border-b border-pf-line pb-3 text-xs text-pf-muted">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-semibold text-pf-fg">0{n + 1} / 05</span>
          <span className="font-semibold text-pf-fg">{info.title}</span>
        </div>
        {info.subtitle ? (
          <span className="hidden text-xs text-pf-muted sm:inline">{info.subtitle}</span>
        ) : null}
      </div>
      <div className="my-auto py-4">{children}</div>
    </div>
  );
}

export function PitchDeck({ p, deck, theme }: { p: Portfolio; deck?: FiveSlideDeck | undefined; theme: ThemeName }) {
  const [i, setI] = useState(0);
  const touch = useRef<number | null>(null);
  const next = useCallback(() => setI((x) => Math.min(4, x + 1)), []);
  const prev = useCallback(() => setI((x) => Math.max(0, x - 1)), []);

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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slides = [
    <Frame n={0} key={0}>
      <p className="text-sm font-semibold text-pf-muted sm:text-base">{s1.role}</p>
      <h2 className="mt-2 font-display text-3xl font-bold leading-[1.05] sm:text-5xl">{s1.name}</h2>
      <p className="mt-4 max-w-xl text-base text-pf-muted sm:text-xl">{s1.headline}</p>
      <p className="mt-6 max-w-xl text-sm leading-relaxed sm:text-base">{s1.bio}</p>
    </Frame>,
    <Frame n={1} key={1}>
      <h2 className="font-display text-2xl font-bold sm:text-4xl">{s4.title || "Projeto de maior impacto"}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["01", "Desafio", s2.challenge],
          ["02", "Ação na prática", s2.action],
          ["03", "Resultado", s2.result],
        ].map(([num, title, value]) => (
          <div key={num} className="rounded-xl border border-pf-line bg-pf-card p-4">
            <span className="font-mono text-xs text-pf-muted">{num}</span>
            <p className="mt-1 text-sm font-semibold">{title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-pf-muted sm:text-sm">{value}</p>
          </div>
        ))}
      </div>
    </Frame>,
    <Frame n={2} key={2}>
      <h2 className="font-display text-2xl font-bold sm:text-4xl">O que eu trago para o time</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {s3.skills.map((s, k) => (
          <div key={k} className="rounded-xl border border-pf-line bg-pf-card p-3 text-sm font-semibold sm:p-4 sm:text-base">
            <span className="mb-1 block font-display text-pf-muted">0{k + 1}</span>{s}
          </div>
        ))}
      </div>
    </Frame>,
    <Frame n={3} key={3}>
      <h2 className="font-display text-2xl font-bold sm:text-4xl">{s4.title || "Destaques e trajetória"}</h2>
      {s4.metrics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {s4.metrics.map((m, k) => (
            <span key={k} className="rounded-full bg-pf-accent px-3 py-1 text-xs font-semibold text-pf-accent-fg sm:text-sm">{m}</span>
          ))}
        </div>
      )}
      <ol className="mt-6 space-y-3 border-l-2 border-pf-line pl-5">
        {s4.journey.map((j, k) => (
          <li key={k} className="relative text-sm sm:text-base">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-pf-accent" />
            {j}
          </li>
        ))}
      </ol>
    </Frame>,
    <Frame n={4} key={4}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pf-muted">Meu objetivo</p>
      <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold leading-tight sm:text-4xl">{s5.goal}</h2>
      <ContactLinks p={{ ...p, ...s5 }} className="mt-8" />
    </Frame>,
  ];

  return (
    <div className={`theme-${theme}`}>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-2xl border border-pf-line bg-pf-bg text-pf-fg shadow-2xl print:hidden"
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
        <div className="absolute bottom-0 left-0 h-1 bg-pf-accent transition-all" style={{ width: `${((i + 1) / 5) * 100}%` }} />
      </div>
      <div className="hidden space-y-6 print:block">
        {slides.map((s, idx) => (
          <div key={idx} className="aspect-video w-full break-inside-avoid overflow-hidden rounded-2xl border border-pf-line bg-pf-bg text-pf-fg">
            {s}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between print:hidden">
        <button onClick={prev} disabled={i === 0} aria-label="Slide anterior"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        <div className="flex gap-1.5">
          {DECK_SLIDES_METADATA.map((info, k) => (
            <button key={info.title} onClick={() => setI(k)} aria-label={info.title}
              className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-primary" : "w-2 bg-border"}`} />
          ))}
        </div>
        <button onClick={next} disabled={i === 4} aria-label="Próximo slide"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40">
          Próximo <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground print:hidden">Use as setas ← → do teclado</p>
    </div>
  );
}
