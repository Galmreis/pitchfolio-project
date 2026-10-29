import { z } from "zod";

export const interviewInputSchema = z.object({
  role: z.string().default("Profissional em início de carreira"),
  projectTitle: z.string().default("Projeto em destaque"),
  challenge: z.string().min(1, "Descreva o contexto ou desafio do projeto."),
  action: z.string().min(1, "Descreva o que você fez na prática."),
  result: z.string().min(1, "Descreva os resultados ou aprendizados."),
  skills: z.array(z.string()).default([]),
});

export type InterviewInput = z.infer<typeof interviewInputSchema>;

export const interviewQuestionSchema = z.object({
  phase: z.string(),
  question: z.string(),
  intent: z.string(),
  coachingTip: z.string(),
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;

export const interviewResultSchema = z.object({
  projectTitle: z.string(),
  questions: z.array(interviewQuestionSchema).length(3),
});

export type InterviewResult = z.infer<typeof interviewResultSchema>;
