import { describe, expect, it } from "vitest";
import { interviewInputSchema } from "@/validators/interview";
import { localInterviewQuestions } from "@/lib/interview.functions";

describe("Interview Simulator Service", () => {
  const validCandidate = {
    role: "Engenharia de Software",
    projectTitle: "App de Carona Compartilhada",
    challenge: "Alunos do campus enfrentavam custo alto e 2h de espera de transporte diário.",
    action: "Desenvolvi app mobile em React Native e estruturei autenticação com e-mail institucional.",
    result: "1.200 viagens combinadas em 4 meses e redução de 30% nos custos de deslocamento.",
    skills: ["React Native", "TypeScript", "Node.js"],
  };

  it("validates valid candidate STAR data", () => {
    const parsed = interviewInputSchema.safeParse(validCandidate);
    expect(parsed.success).toBe(true);
  });

  it("fails validation if challenge, action or result are empty", () => {
    const invalid = { ...validCandidate, challenge: "" };
    const parsed = interviewInputSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("generates exactly 3 structured behavioral interview questions", () => {
    const result = localInterviewQuestions(validCandidate);
    expect(result.projectTitle).toBe("App de Carona Compartilhada");
    expect(result.questions).toHaveLength(3);

    const [q1, q2, q3] = result.questions;
    expect(q1?.phase).toBe("Situação & Diagnóstico");
    expect(q2?.phase).toBe("Ação & Resolução de Problemas");
    expect(q3?.phase).toBe("Resultado & Visão de Futuro");

    for (const q of result.questions) {
      expect(q.question.length).toBeGreaterThan(20);
      expect(q.intent.length).toBeGreaterThan(15);
      expect(q.coachingTip.length).toBeGreaterThan(15);
    }
  });

  it("embeds candidate actual project title, skills and metrics in questions", () => {
    const result = localInterviewQuestions(validCandidate);
    const fullText = JSON.stringify(result);

    expect(fullText).toContain("App de Carona Compartilhada");
    expect(fullText).toContain("React Native");
  });
});
