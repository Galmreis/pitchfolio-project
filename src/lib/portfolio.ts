export type ThemeName = "moderno" | "quente" | "minimal";

export const THEMES: { id: ThemeName; label: string }[] = [
  { id: "moderno", label: "Moderno" },
  { id: "quente", label: "Quente" },
  { id: "minimal", label: "Minimal" },
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

export type Draft = { portfolio: Portfolio; theme: ThemeName; slug?: string };

export function normalizeUrl(u: string) {
  if (!u) return "";
  return /^https?:\/\//.test(u) ? u : `https://${u}`;
}
