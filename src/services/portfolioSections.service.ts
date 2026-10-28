import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { FiveSlideDeck } from "@/types/pitchfolio";

type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export type PublicProject = Pick<Row<"user_projects">, "id" | "name" | "description" | "technologies" | "repository_url" | "deploy_url" | "stars" | "is_highlight">;
export type PublicSkill = Pick<Row<"user_skills">, "id" | "name" | "category" | "source">;
export type PublicCertification = Pick<Row<"user_certifications">, "id" | "title" | "issuer" | "issue_date" | "credential">;
export type PublicTimelineItem = Pick<Row<"professional_timeline">, "id" | "role" | "organization" | "start_date" | "end_date" | "is_current" | "description">;

export type PortfolioSections = {
  projects: PublicProject[];
  skills: PublicSkill[];
  certifications: PublicCertification[];
  timeline: PublicTimelineItem[];
};

export const EMPTY_SECTIONS: PortfolioSections = { projects: [], skills: [], certifications: [], timeline: [] };

// Extra slide data is additive: existing slide fields stay intact so current screens keep working.
export type CuratedDeck = FiveSlideDeck & {
  slide_2_what_i_did: FiveSlideDeck["slide_2_what_i_did"] & { timeline: PublicTimelineItem[] };
  slide_3_skills: FiveSlideDeck["slide_3_skills"] & { skill_items: PublicSkill[] };
  slide_4_highlight: FiveSlideDeck["slide_4_highlight"] & { project: PublicProject | null; certifications: PublicCertification[] };
};

// Reads only visible items. RLS already hides unpublished/hidden rows from visitors;
// the explicit filter also keeps owner-authenticated reads from showing hidden items publicly.
export async function loadVisibleSections(client: SupabaseClient<Database>, portfolioId: string): Promise<PortfolioSections> {
  const [projects, skills, certifications, timeline] = await Promise.all([
    client.from("user_projects").select("id,name,description,technologies,repository_url,deploy_url,stars,is_highlight")
      .eq("portfolio_id", portfolioId).eq("is_visible", true).order("display_order").limit(50),
    client.from("user_skills").select("id,name,category,source")
      .eq("portfolio_id", portfolioId).eq("is_visible", true).order("display_order").limit(60),
    client.from("user_certifications").select("id,title,issuer,issue_date,credential")
      .eq("portfolio_id", portfolioId).eq("is_visible", true).order("display_order").limit(30),
    client.from("professional_timeline").select("id,role,organization,start_date,end_date,is_current,description")
      .eq("portfolio_id", portfolioId).eq("is_visible", true).order("display_order").limit(30),
  ]);
  // A failing section degrades to empty instead of breaking the whole public page.
  return {
    projects: projects.data ?? [],
    skills: skills.data ?? [],
    certifications: certifications.data ?? [],
    timeline: timeline.data ?? [],
  };
}

// Pure merge: curated items feed slides 2 (timeline), 3 (skills) and 4 (highlight).
export function applySectionsToDeck(deck: FiveSlideDeck, s: PortfolioSections): CuratedDeck {
  const highlight = s.projects.find((p) => p.is_highlight) ?? null;
  return {
    ...deck,
    slide_2_what_i_did: { ...deck.slide_2_what_i_did, timeline: s.timeline },
    slide_3_skills: {
      // Curated skills replace free-text skills when the user selected any.
      skills: s.skills.length ? s.skills.map((k) => k.name) : deck.slide_3_skills.skills,
      skill_items: s.skills,
    },
    slide_4_highlight: {
      ...deck.slide_4_highlight,
      title: highlight?.name ?? deck.slide_4_highlight.title,
      project: highlight,
      certifications: s.certifications,
    },
  };
}
