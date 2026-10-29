import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Loader2,
  MessageSquareQuote,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateInterviewQuestions } from "@/lib/interview.functions";
import type { Portfolio } from "@/lib/portfolio";
import type { InterviewResult } from "@/validators/interview";

interface InterviewSimulatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio;
}

export function InterviewSimulatorDialog({
  open,
  onOpenChange,
  portfolio,
}: InterviewSimulatorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InterviewResult | null>(null);
  const [userDraftAnswer, setUserDraftAnswer] = useState("");
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  const getQuestions = useServerFn(generateInterviewQuestions);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await getQuestions({
        data: {
          role: portfolio.role,
          projectTitle: portfolio.projectTitle || "Projeto principal",
          challenge: portfolio.challenge,
          action: portfolio.action,
          result: portfolio.result,
          skills: portfolio.skills,
        },
      });
      setData(res.result);
      if (res.ai) {
        toast.success("Perguntas de entrevista geradas com IA!");
      } else {
        toast.message("Perguntas estruturadas com base no seu caso STAR.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível gerar a simulação no momento.");
    } finally {
      setLoading(false);
    }
  }

  // Basic STAR heuristics for the practice scratchpad
  const hasSituation =
    userDraftAnswer.length > 25 &&
    /(quando|problema|cenário|situação|desafio|contexto|início)/i.test(userDraftAnswer);
  const hasAction =
    userDraftAnswer.length > 25 &&
    /(desenvolvi|fiz|criei|implementei|liderei|utilizei|estruturei|organizei)/i.test(
      userDraftAnswer
    );
  const hasResult =
    userDraftAnswer.length > 25 &&
    /(resultado|aprendi|gerou|reduziu|aumentou|impacto|%|métrica|consegui)/i.test(
      userDraftAnswer
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-mono text-xs">
            <MessageSquareQuote className="h-4 w-4" />
            <span>Simulador de Entrevista STAR · Case 3</span>
          </div>
          <DialogTitle className="font-display text-2xl font-bold">
            Perguntas Prováveis de Entrevista
          </DialogTitle>
          <DialogDescription>
            Recrutadores não adivinham seu potencial: eles fazem perguntas comportamentais sobre
            projetos reais. Veja o que esperar e como defender seu caso.
          </DialogDescription>
        </DialogHeader>

        {!data ? (
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Projeto analisado:
              </span>
              <p className="font-display text-base font-bold text-foreground">
                {portfolio.projectTitle || "Projeto de maior impacto"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {portfolio.challenge}
              </p>
            </div>

            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                A IA analisa seu desafio, ação e métricas para prever as 3 perguntas mais prováveis
                que um entrevistador fará na triagem.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                size="lg"
                className="rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando caso STAR...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Simulação de Entrevista
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Step selector */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              {data.questions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestionIdx(idx)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    activeQuestionIdx === idx
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pergunta 0{idx + 1} · {q.phase.split("&")[0]}
                </button>
              ))}
            </div>

            {/* Active Question Display */}
            {data.questions[activeQuestionIdx] && (
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-primary">
                    <span className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      Foco: {data.questions[activeQuestionIdx]!.phase}
                    </span>
                    <span className="font-mono text-[10px]">
                      0{activeQuestionIdx + 1} de 03
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground leading-snug">
                    "{data.questions[activeQuestionIdx]!.question}"
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <HelpCircle className="h-3.5 w-3.5 text-primary" />
                      <span>O que o recrutador quer avaliar:</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {data.questions[activeQuestionIdx]!.intent}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      <span>Dica estratégica de resposta:</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {data.questions[activeQuestionIdx]!.coachingTip}
                    </p>
                  </div>
                </div>

                {/* Practice Scratchpad */}
                <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Pratique sua resposta oral (Rascunho):
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Não será salvo publicamente
                    </span>
                  </div>
                  <Textarea
                    rows={3}
                    placeholder="Comece contextualizando a situação, sua ação direta e o resultado atingido..."
                    value={userDraftAnswer}
                    onChange={(e) => setUserDraftAnswer(e.target.value)}
                    className="text-xs"
                  />

                  {/* Real-time STAR Checklist */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    <span className="font-medium text-muted-foreground">Checklist STAR:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        hasSituation ? "text-emerald-500" : "text-muted-foreground/60"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Situação/Contexto
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        hasAction ? "text-emerald-500" : "text-muted-foreground/60"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Ação Prática
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        hasResult ? "text-emerald-500" : "text-muted-foreground/60"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Resultado/Métrica
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={loading}
                className="text-xs"
              >
                <RefreshCw
                  className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Regenerar perguntas
              </Button>
              <Button onClick={() => onOpenChange(false)} size="sm">
                Concluir treino
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
