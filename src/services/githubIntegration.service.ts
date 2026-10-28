import { z } from "zod";
import { githubUsernameSchema, type ProjectItem, type SkillItem } from "@/validators/curation";

// Only the fields we use; anything else from GitHub is ignored.
const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.string(),
  homepage: z.string().nullable().optional(),
  language: z.string().nullable(),
  stargazers_count: z.number().int(),
  fork: z.boolean(),
  topics: z.array(z.string()).optional(),
  pushed_at: z.string().nullable().optional(),
});

export class GithubIntegrationError extends Error {
  constructor(public code: "NOT_FOUND" | "RATE_LIMITED" | "TIMEOUT" | "UNAVAILABLE", message: string) {
    super(message);
  }
}

export const TOP_VISIBLE_REPOS = 4;

const safeHttps = (u: string | null | undefined) => {
  if (!u) return null;
  const url = u.startsWith("http") ? u : `https://${u}`;
  return /^https:\/\/[^\s<>"]+$/.test(url) ? url.slice(0, 500) : null;
};

// Pure mapper so pre-selection is testable without network access.
export function mapGithubRepos(raw: unknown[]): { projects: ProjectItem[]; skills: SkillItem[] } {
  const repos = raw.map((r) => repoSchema.safeParse(r)).flatMap((r) => (r.success && !r.data.fork ? [r.data] : []));
  // Rank by stars, then by recent activity; only the top ones start visible to keep the preview clean.
  const ranked = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count || (b.pushed_at ?? "").localeCompare(a.pushed_at ?? ""));
  const projects = ranked.map((r, i): ProjectItem => ({
    name: r.name.slice(0, 160),
    description: (r.description ?? "").slice(0, 1000),
    technologies: Array.from(new Set([r.language, ...(r.topics ?? [])].filter((t): t is string => Boolean(t)))).slice(0, 20),
    repository_url: safeHttps(r.html_url),
    deploy_url: safeHttps(r.homepage),
    stars: r.stargazers_count,
    is_highlight: i === 0,
    is_visible: i < TOP_VISIBLE_REPOS,
    display_order: i,
  }));
  const langCount = new Map<string, number>();
  for (const r of repos) if (r.language) langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
  const skills = [...langCount.entries()].sort((a, b) => b[1] - a[1]).map(([name], i): SkillItem => ({
    name: name.slice(0, 80), category: "language", source: "github", is_visible: i < 6, display_order: i,
  }));
  return { projects, skills };
}

export async function fetchGithubPortfolioData(username: unknown, timeoutMs = 8000) {
  const user = githubUsernameSchema.parse(username);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "PitchFolio" },
      signal: ctrl.signal,
    });
    if (res.status === 404) throw new GithubIntegrationError("NOT_FOUND", "Usuário do GitHub não encontrado.");
    if (res.status === 429 || (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0")) {
      throw new GithubIntegrationError("RATE_LIMITED", "Limite do GitHub atingido. Tente em alguns minutos.");
    }
    if (!res.ok) throw new GithubIntegrationError("UNAVAILABLE", "GitHub indisponível no momento.");
    const body: unknown = await res.json();
    return { username: user, ...mapGithubRepos(Array.isArray(body) ? body : []) };
  } catch (e) {
    if (e instanceof GithubIntegrationError) throw e;
    if (e instanceof Error && e.name === "AbortError") throw new GithubIntegrationError("TIMEOUT", "O GitHub demorou para responder.");
    throw new GithubIntegrationError("UNAVAILABLE", "GitHub indisponível no momento.");
  } finally {
    clearTimeout(timer);
  }
}
