import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ACCENT_COLORS, HEX_COLOR_RE, type AccentColor } from "@/lib/portfolio";

const RAINBOW = "conic-gradient(#ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)";

/**
 * Normalizes any CSS color the browser understands (hex with or without #,
 * rgb(), hsl(), oklch(), names) to `#rrggbb` by painting one canvas pixel.
 * Translucent colors are flattened onto white. Returns null when invalid.
 */
function parseColorInput(raw: string): `#${string}` | null {
  const v = raw.trim();
  if (!v || /var\(|currentcolor|inherit|initial|unset|revert/i.test(v)) return null;
  const candidate = /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? `#${v}` : v;
  if (typeof CSS === "undefined" || !CSS.supports("color", candidate)) return null;
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = candidate;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Hex shown for the current accent, so the picker always opens on the active color. */
function currentHex(value?: AccentColor): string {
  if (value && HEX_COLOR_RE.test(value)) return value;
  return ACCENT_COLORS.find((c) => c.id === value)?.swatch ?? ACCENT_COLORS[0]!.swatch;
}

export function AccentColorPicker({ value, onChange }: { value?: AccentColor | undefined; onChange: (next: AccentColor | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState(false);
  const isCustom = !!value && HEX_COLOR_RE.test(value);
  const hex = currentHex(value);

  useEffect(() => {
    if (open) { setText(hex); setError(false); }
    // Reset the field only when the popover opens, not on every color change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function apply() {
    const parsed = parseColorInput(text);
    if (!parsed) { setError(true); return; }
    setError(false);
    setText(parsed);
    onChange(parsed);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Escolher qualquer cor"
          aria-label="Escolher cor personalizada"
          className={`relative h-6 w-6 rounded-full transition-transform hover:scale-110 ${
            isCustom ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
          }`}
          style={{ background: RAINBOW }}
        >
          <span
            className="absolute inset-[5px] rounded-full border-2 border-card"
            style={{ backgroundColor: isCustom ? hex : "var(--card)" }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <div>
          <p className="text-sm font-semibold">Cor personalizada</p>
          <p className="text-xs text-muted-foreground">Fundos, cartões, bordas e destaques mudam juntos no site e no deck.</p>
        </div>
        <input
          type="color"
          aria-label="Seletor visual de cor"
          value={hex}
          onChange={(e) => { setText(e.target.value); setError(false); onChange(e.target.value as `#${string}`); }}
          className="h-24 w-full cursor-pointer rounded-lg border border-border bg-transparent p-1"
        />
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => { setText(e.target.value); setError(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
              placeholder="#1e88e5 ou rgb(30, 136, 229)"
              aria-label="Código da cor"
              aria-invalid={error}
              className="font-mono text-xs"
            />
            <Button type="button" size="icon" variant="secondary" onClick={apply} aria-label="Aplicar cor">
              <Check className="h-4 w-4" />
            </Button>
          </div>
          <p className={`text-[11px] ${error ? "text-destructive" : "text-muted-foreground"}`}>
            {error ? "Cor não reconhecida. Tente #1e88e5, rgb(30, 136, 229) ou hsl(210, 80%, 50%)." : "Aceita HEX, RGB, HSL ou o nome da cor em inglês."}
          </p>
        </div>
        {value && (
          <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => { onChange(undefined); setOpen(false); }}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Voltar às cores originais do tema
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
