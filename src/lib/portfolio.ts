import type { CSSProperties } from "react";

export type ThemeName = "moderno" | "quente" | "minimal";
export type AccentPreset =
  | "laranja"
  | "azul"
  | "esmeralda"
  | "violeta"
  | "rosa"
  | "ambar"
  | "ciano"
  | "indigo"
  | "lima"
  | "grafite";
/** A preset id or a custom color normalized to lowercase `#rrggbb`. */
export type AccentColor = AccentPreset | `#${string}`;
export type SectionOrder = "project_first" | "journey_first";
export type LayoutStyle = "bento" | "split" | "indice";

export const THEMES: { id: ThemeName; label: string; layoutLabel: string }[] = [
  { id: "moderno", label: "Moderno", layoutLabel: "Painel" },
  { id: "quente", label: "Quente", layoutLabel: "Coluna" },
  { id: "minimal", label: "Minimal", layoutLabel: "Editorial" },
];

export const LAYOUT_STYLES: { id: LayoutStyle; label: string }[] = [
  { id: "bento", label: "Painel em Blocos" },
  { id: "split", label: "Coluna Lateral" },
  { id: "indice", label: "Editorial Limpo" },
];

export function resolveLayoutStyle(theme: ThemeName, custom?: LayoutStyle): LayoutStyle {
  if (custom) return custom;
  if (theme === "quente") return "split";
  if (theme === "minimal") return "indice";
  return "bento";
}

export const ACCENT_COLORS: { id: AccentPreset; label: string; swatch: string }[] = [
  { id: "laranja", label: "Terracota", swatch: "#c84b16" },
  { id: "azul", label: "Cobalto", swatch: "#2563eb" },
  { id: "esmeralda", label: "Esmeralda", swatch: "#059669" },
  { id: "violeta", label: "Violeta", swatch: "#7c3aed" },
  { id: "rosa", label: "Carmim", swatch: "#e11d48" },
  { id: "ambar", label: "Âmbar Dourado", swatch: "#d97706" },
  { id: "ciano", label: "Ciano Tech", swatch: "#0891b2" },
  { id: "indigo", label: "Índigo Profundo", swatch: "#4f46e5" },
  { id: "lima", label: "Verde Lima", swatch: "#65a30d" },
  { id: "grafite", label: "Grafite Minimal", swatch: "#475569" },
];

export const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

/** Picks near-white or near-black text, whichever contrasts more with the hex background (WCAG luminance). */
export function readableTextOn(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (1.05 / (lum + 0.05)) >= ((lum + 0.05) / 0.05) ? "#fdfbf8" : "#17120f";
}

/**
 * Class and inline vars for a portfolio's accent. Any chosen accent also tints
 * backgrounds, cards and lines (`pf-tinted` in styles.css); no accent keeps the
 * theme's original surfaces. Custom colors only reach `style` after the hex check.
 */
export function accentProps(accent?: AccentColor): { className: string; style?: CSSProperties } {
  if (!accent) return { className: "" };
  if (HEX_COLOR_RE.test(accent)) {
    return {
      className: "pf-tinted",
      style: { "--pf-accent": accent, "--pf-accent-fg": readableTextOn(accent) } as CSSProperties,
    };
  }
  return ACCENT_COLORS.some((c) => c.id === accent) ? { className: `pf-accent-${accent} pf-tinted` } : { className: "" };
}

export const AVATAR_PRESETS: { label: string; url: string }[] = [
  { label: "Ilustração 1", url: "/visuals/avatar-ana.svg" },
  { label: "Ilustração 2", url: "/visuals/avatar-dev.svg" },
  { label: "Ilustração 3", url: "/visuals/avatar-design.svg" },
];

export const PROJECT_IMAGE_PRESETS: { label: string; url: string }[] = [
  { label: "Projeto & Impacto", url: "/visuals/project-caronas.svg" },
  { label: "Dados & Indicadores", url: "/visuals/project-analytics.svg" },
  { label: "Processo & Sistema", url: "/visuals/project-system.svg" },
];

export type RawAnswers = {
  name: string;
  area: string;
  bio: string;
  challenge: string;
  action: string;
  result: string;
  skills: string;
  linkedin: string;
  github: string;
  email: string;
  goal: string;
};

export type Portfolio = {
  name: string;
  role: string;
  headline: string;
  bio: string;
  projectTitle: string;
  challenge: string;
  action: string;
  result: string;
  metrics: string[];
  skills: string[];
  journey: string[];
  goal: string;
  linkedin: string;
  github: string;
  email: string;
  accentColor?: AccentColor | undefined;
  sectionOrder?: SectionOrder | undefined;
  layoutStyle?: LayoutStyle | undefined;
  avatarUrl?: string | undefined;
  projectImageUrl?: string | undefined;
};

export const EMPTY_ANSWERS: RawAnswers = {
  name: "",
  area: "",
  bio: "",
  challenge: "",
  action: "",
  result: "",
  skills: "",
  linkedin: "",
  github: "",
  email: "",
  goal: "",
};

export const DEMO_ANSWERS: RawAnswers = {
  name: "Ana Souza",
  area: "Engenharia de Software · UFPE",
  bio: "Estudante do 6º período focada em desenvolvimento full-stack e produtos digitais acessíveis.",
  challenge: "Mais de 400 alunos do campus dependiam de grupos desencontrados para dividir transporte diário.",
  action: "Desenvolvi uma aplicação web em React e TypeScript com rotas compartilhadas e validação por e-mail institucional.",
  result: "1.200 viagens combinadas em 4 meses e redução de 30% no gasto médio semanal dos estudantes.",
  skills: "React, TypeScript, Node.js, PostgreSQL, Pesquisa com Usuários",
  linkedin: "linkedin.com/in/ana-souza-demo",
  github: "github.com/anasouza-demo",
  email: "ana.demo@exemplo.com",
  goal: "Busco estágio em engenharia de software para construir produtos web com impacto direto no usuário.",
};

export type DemoPersona = {
  id: "ana" | "lucas" | "marina";
  slug: string;
  shortLabel: string;
  courseShort: string;
  badgeMetric: string;
  theme: ThemeName;
  accentColor: AccentColor;
  projectTitle: string;
  metrics: string[];
  avatarUrl: string;
  projectImageUrl: string;
  answers: RawAnswers;
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "ana",
    slug: "ana-souza-demo",
    shortLabel: "Tecnologia",
    courseShort: "Eng. Software · 6º per.",
    badgeMetric: "1.200 viagens",
    theme: "moderno",
    accentColor: "laranja",
    projectTitle: "UniRota · App de Caronas Universitárias",
    metrics: ["1.200 viagens", "4 meses", "-30% custo"],
    avatarUrl: "/visuals/avatar-ana.svg",
    projectImageUrl: "/visuals/project-caronas.svg",
    answers: DEMO_ANSWERS,
  },
  {
    id: "lucas",
    slug: "lucas-mendes-demo",
    shortLabel: "Gestão & Negócios",
    courseShort: "Administração · 8º per.",
    badgeMetric: "-42% tempo",
    theme: "quente",
    accentColor: "esmeralda",
    projectTitle: "Fluxo Ágil de Diagnóstico para Pequenos Negócios",
    metrics: ["-42% tempo", "18 empresas", "NPS 92"],
    avatarUrl: "/visuals/avatar-dev.svg",
    projectImageUrl: "/visuals/project-analytics.svg",
    answers: {
      name: "Lucas Mendes",
      area: "Administração · UNIFAL-MG",
      bio: "Formando em Administração com vivência prática em consultoria financeira e melhoria de processos na Empresa Júnior.",
      challenge: "Pequenos comerciantes locais levavam até 3 semanas para receber um diagnóstico financeiro básico devido a planilhas manuais fragmentadas.",
      action: "Padronizei o roteiro de coleta em 4 etapas, criei um painel único de indicadores de caixa e treinei 12 consultores da equipe.",
      result: "Redução de 42% no tempo de entrega dos projetos, atendendo 18 microempresas da região com índice de satisfação de 92%.",
      skills: "Gestão de Processos, Análise Financeira, Excel Avançado, Negociação, Liderança de Equipe",
      linkedin: "linkedin.com/in/lucas-mendes-demo",
      github: "lucasmendes.com.br",
      email: "lucas.demo@exemplo.com",
      goal: "Busco atuar como Trainee ou Analista Júnior de Operações e Negócios, aplicando gestão orientada a indicadores.",
    },
  },
  {
    id: "marina",
    slug: "marina-costa-demo",
    shortLabel: "Design & Comunicação",
    courseShort: "Design & Comunicação · 7º per.",
    badgeMetric: "94% aprovação",
    theme: "minimal",
    accentColor: "violeta",
    projectTitle: "Guia Visual e Kit de Acolhimento para Calouros",
    metrics: ["94% aprovação", "650 alunos", "-60% dúvidas"],
    avatarUrl: "/visuals/avatar-design.svg",
    projectImageUrl: "/visuals/project-system.svg",
    answers: {
      name: "Marina Costa",
      area: "Design & Comunicação · UFMG",
      bio: "Estudante do 7º período apaixonada por comunicação acessível, identidade visual e experiência do usuário em serviços públicos.",
      challenge: "Ingressantes perdiam prazos de matrícula e bolsas por excesso de editais extensos e informações espalhadas em dezenas de páginas.",
      action: "Conduzi entrevistas com 45 calouros, redesenhei a jornada de boas-vindas em um guia visual interativo e alinhei a comunicação com a coordenação.",
      result: "Adoção por 650 novos estudantes no semestre, 94% de aprovação na pesquisa de clareza e queda de 60% nas dúvidas repetidas na secretaria.",
      skills: "Pesquisa com Usuários, Comunicação Visual, Figma, Redação Clara, Gestão de Projetos",
      linkedin: "linkedin.com/in/marina-costa-demo",
      github: "behance.net/marinacosta-demo",
      email: "marina.demo@exemplo.com",
      goal: "Busco estágio ou posição júnior em Design de Produto ou Comunicação Institucional com foco em impacto social.",
    },
  },
];

export function buildPersonaPortfolio(persona: DemoPersona = DEMO_PERSONAS[0]!): Portfolio {
  return {
    ...localStructure(persona.answers),
    projectTitle: persona.projectTitle,
    metrics: persona.metrics,
    accentColor: persona.accentColor,
    avatarUrl: persona.avatarUrl,
    projectImageUrl: persona.projectImageUrl,
  };
}

const cap = (s: string) => {
  const t = s.trim().replace(/\s+/g, " ");
  if (!t) return t;
  const c = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(c) ? c : c + ".";
};

export function splitSkills(s: string): string[] {
  return s
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 6);
}

/** Local fallback used when the AI is unavailable. */
export function localStructure(a: RawAnswers): Portfolio {
  const skills = splitSkills(a.skills);
  const nums = (a.result.match(/\d+[\d.,]*\s?%?[^\s,.]*/g) ?? []).slice(0, 3);
  return {
    name: a.name.trim(),
    role: a.area.trim(),
    headline: a.area.trim(),
    bio: cap(a.bio),
    projectTitle: "Projeto de maior impacto",
    challenge: cap(a.challenge),
    action: cap(a.action),
    result: cap(a.result),
    metrics: nums,
    skills,
    journey: [cap(a.bio).slice(0, 500), cap(a.action).slice(0, 500), cap(a.goal).slice(0, 500)].filter(Boolean),
    goal: cap(a.goal),
    linkedin: a.linkedin.trim(),
    github: a.github.trim(),
    email: a.email.trim(),
  };
}

export function slugify(s: string): string {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "portfolio"
  );
}

export const DRAFT_KEY = "pitchfolio-draft";
export const ANSWERS_KEY = "pitchfolio-answers";

import type { FiveSlideDeck } from "@/types/pitchfolio";

export type Draft = { portfolio: Portfolio; deck?: FiveSlideDeck; theme: ThemeName; slug?: string };

export function normalizeUrl(u: string) {
  if (!u) return "";
  return /^https?:\/\//.test(u) ? u : `https://${u}`;
}
