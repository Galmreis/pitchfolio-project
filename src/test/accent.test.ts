import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, accentProps, localStructure, readableTextOn } from "@/lib/portfolio";
import { portfolioSchema } from "@/validators/portfolio";

const p = localStructure({ ...EMPTY_ANSWERS, name: "Ana Teste" });

describe("Accent colors", () => {
  it("accepts presets and custom hex, normalizing hex to lowercase", () => {
    expect(portfolioSchema.parse({ ...p, accentColor: "azul" }).accentColor).toBe("azul");
    expect(portfolioSchema.parse({ ...p, accentColor: "#1E88E5" }).accentColor).toBe("#1e88e5");
  });

  it("rejects anything that is not a preset or a #rrggbb hex", () => {
    for (const bad of ["red", "#fff", "rgb(0,0,0)", "#123456; background:url(x)", "var(--x)"]) {
      expect(portfolioSchema.safeParse({ ...p, accentColor: bad }).success).toBe(false);
    }
  });

  it("tints surfaces for presets and custom colors, and keeps the theme when unset", () => {
    expect(accentProps(undefined)).toEqual({ className: "" });
    expect(accentProps("azul").className).toBe("pf-accent-azul pf-tinted");
    const custom = accentProps("#1e88e5");
    expect(custom.className).toBe("pf-tinted");
    expect(custom.style).toMatchObject({ "--pf-accent": "#1e88e5" });
  });

  it("picks readable text over light and dark accents", () => {
    expect(readableTextOn("#ffeb3b")).toBe("#17120f");
    expect(readableTextOn("#1a237e")).toBe("#fdfbf8");
  });
});
