import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, localStructure } from "@/lib/portfolio";
import { createDeck, deckSchema, draftSchema, ingestionSchema, portfolioSchema } from "@/validators/portfolio";
import { generatePortfolioAndDeck, groundedPortfolio, processInput } from "@/services/aiProcessor.service";
import { validateUpload } from "@/validators/uploads";

const answers = { ...EMPTY_ANSWERS, name: "Ana Teste", area: "Design", bio: "Sou estudante de Design", challenge: "Usuários não encontravam vagas", action: "Organizei entrevistas", result: "20 entrevistas realizadas", skills: "Design, Pesquisa, Comunicação", goal: "Atuar como Product Designer em startups" };
const p = localStructure(answers);
describe("PitchFolio business rules", () => {
  it("allows exactly the three requested themes", () => {
    for (const theme of ["moderno", "quente", "minimal"]) expect(draftSchema.safeParse({ portfolio: p, theme }).success).toBe(true);
    expect(draftSchema.safeParse({ portfolio: p, theme: "other" }).success).toBe(false);
  });
  it("derives the required five slides from one dataset", () => {
    const deck = createDeck(p);
    expect(Object.keys(deck)).toEqual(["slide_1_who_i_am", "slide_2_what_i_did", "slide_3_skills", "slide_4_highlight", "slide_5_contact"]);
    expect(deck.slide_2_what_i_did.action).toBe("Organizei entrevistas.");
    expect(deck.slide_3_skills.skills).toEqual(["Design", "Pesquisa", "Comunicação"]);
  });
  it("generates pitch deck together with portfolio demonstrating objectives, potential, workspace/role and skills", () => {
    const { portfolio, deck } = generatePortfolioAndDeck(answers);
    expect(portfolio.name).toBe("Ana Teste");
    expect(deckSchema.safeParse(deck).success).toBe(true);

    // Onde ele sabe trabalhar (área, perfil e posicionamento)
    expect(deck.slide_1_who_i_am.name).toBe("Ana Teste");
    expect(deck.slide_1_who_i_am.role).toBe("Design");
    expect(deck.slide_1_who_i_am.bio).toBe("Sou estudante de Design.");

    // Seu potencial na prática (método STAR)
    expect(deck.slide_2_what_i_did.challenge).toBe("Usuários não encontravam vagas.");
    expect(deck.slide_2_what_i_did.action).toBe("Organizei entrevistas.");
    expect(deck.slide_2_what_i_did.result).toBe("20 entrevistas realizadas.");

    // Quais são as suas habilidades
    expect(deck.slide_3_skills.skills).toEqual(["Design", "Pesquisa", "Comunicação"]);

    // Destaques e métricas de impacto
    expect(deck.slide_4_highlight.metrics).toEqual(["20 entrevistas"]);

    // Quais são os seus objetivos
    expect(deck.slide_5_contact.goal).toBe("Atuar como Product Designer em startups.");
  });
  it("validates draft with pitch deck included", () => {
    const deck = createDeck(p);
    const draft = { portfolio: p, deck, theme: "moderno" as const };
    expect(draftSchema.safeParse(draft).success).toBe(true);
  });
  it("does not invent leadership or metrics in fallback", () => {
    const result = localStructure({ ...answers, result: "Aprendi a entrevistar" });
    expect(result.action).toBe("Organizei entrevistas.");
    expect(result.metrics).toEqual([]);
    expect(result.journey.join(" ")).not.toContain("resultados mensuráveis");
  });
  it("rejects an AI result containing invented numbers", () => {
    expect(groundedPortfolio({ ...p, result: "Conquistei 500 usuários" }, answers).result).toBe("20 entrevistas realizadas.");
  });
  it("rejects an AI result containing an invented employer", () => {
    expect(groundedPortfolio({ ...p, bio: "Trabalhei na Microsoft" }, answers).bio).toBe("Sou estudante de Design.");
  });
  it("validates parsed PDF and LinkedIn text without signup and generates deck", () => {
    for (const method of ["pdf_upload", "linkedin_text"] as const) {
      const input = { method, name: "Ana", text: "Sou estudante de Design e organizei entrevistas." };
      expect(ingestionSchema.safeParse(input).success).toBe(true);
      const res = processInput(input);
      expect(res.portfolio.bio).toBe(input.text);
      expect(res.deck.slide_1_who_i_am.name).toBe("Ana");
      expect(deckSchema.safeParse(res.deck).success).toBe(true);
    }
  });
  it("rejects HTML and executable contact links", () => {
    expect(portfolioSchema.safeParse({ ...p, bio: "<script>alert(1)</script>" }).success).toBe(false);
    expect(portfolioSchema.safeParse({ ...p, linkedin: "javascript:alert(1)" }).success).toBe(false);
    expect(portfolioSchema.safeParse({ ...p, linkedin: "linkedin.com/in/ana" }).success).toBe(true);
  });
  it("rejects an image disguised as a resume PDF", () => {
    expect(() => validateUpload({ bucket: "resumes", filename: "resume.pdf", contentType: "application/pdf", base64: btoa("not a PDF") })).toThrow();
  });
  it("rejects an unsafe owner-upload filename", () => {
    expect(() => validateUpload({ bucket: "resumes", filename: "../resume.pdf", contentType: "application/pdf", base64: btoa("%PDF-1.7") })).toThrow();
  });
});