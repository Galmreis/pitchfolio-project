import { describe, expect, it } from "vitest";
import { mapGithubRepos } from "@/services/githubIntegration.service";
import { groundExtraction } from "@/services/linkedinExtractor.service";
import { curationRequestSchema, githubUsernameSchema } from "@/validators/curation";

const repo = (name: string, stars: number, language: string | null, fork = false) => ({
  name, description: null, html_url: `https://github.com/u/${name}`, homepage: null, language, stargazers_count: stars, fork,
});

describe("GitHub pre-selection", () => {
  it("shows only the top 4 repos by stars and skips forks", () => {
    const { projects } = mapGithubRepos([repo("a", 1, "TS"), repo("b", 9, "TS"), repo("c", 5, "Go"), repo("d", 3, null), repo("e", 7, "TS"), repo("f", 99, "TS", true)]);
    expect(projects.map((p) => p.name)).toEqual(["b", "e", "c", "d", "a"]);
    expect(projects.filter((p) => p.is_visible).map((p) => p.name)).toEqual(["b", "e", "c", "d"]);
  });
  it("extracts unique languages as skills", () => {
    const { skills } = mapGithubRepos([repo("a", 1, "TS"), repo("b", 2, "TS"), repo("c", 3, "Go")]);
    expect(skills.map((s) => s.name)).toEqual(["TS", "Go"]);
  });
  it("accepts profile URLs and rejects invalid usernames", () => {
    expect(githubUsernameSchema.parse("https://github.com/octocat")).toBe("octocat");
    expect(githubUsernameSchema.safeParse("../etc").success).toBe(false);
  });
});

describe("LinkedIn anti-hallucination", () => {
  it("drops companies and dates not present in the text", () => {
    const out = groundExtraction({
      timeline: [
        { role: "Analista de Dados", organization: "Nubank", start_date: "2022-03", end_date: null, is_current: true, description: "" },
        { role: "CTO", organization: "Google", start_date: "2019-01", end_date: null, is_current: false, description: "" },
      ],
      certifications: [{ title: "AWS Cloud Practitioner", issuer: "Amazon", issue_date: "2030-01", credential: null }],
      skills: [{ name: "SQL", category: "hard_skill" }, { name: "Rust", category: "hard_skill" }],
    }, "Analista de Dados na Nubank desde 2022. Certificação AWS Cloud Practitioner (Amazon) 2023. SQL, Python.");
    expect(out.timeline.map((t) => t.organization)).toEqual(["Nubank"]);
    expect(out.certifications).toHaveLength(0);
    expect(out.skills.map((s) => s.name)).toEqual(["SQL"]);
  });
});

describe("Curation request", () => {
  const id = "00000000-0000-4000-8000-000000000001";
  it("allows only one highlight and only on projects", () => {
    expect(curationRequestSchema.safeParse({ items: [{ section: "projects", id, is_highlight: true }, { section: "projects", id, is_highlight: true }] }).success).toBe(false);
    expect(curationRequestSchema.safeParse({ items: [{ section: "skills", id, is_highlight: true }] }).success).toBe(false);
    expect(curationRequestSchema.safeParse({ items: [{ section: "skills", id, is_visible: false }] }).success).toBe(true);
  });
});
