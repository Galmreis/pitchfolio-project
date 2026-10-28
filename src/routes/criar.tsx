import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check, FileUp, ClipboardPaste, Wand2, Github } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/pf/Logo";
import { structurePortfolio } from "@/lib/ai.functions";
import { extractResume } from "@/lib/resume.functions";
import { ANSWERS_KEY, DEMO_ANSWERS, DRAFT_KEY, EMPTY_ANSWERS, splitSkills, type RawAnswers } from "@/lib/portfolio";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Criar portfólio — PitchFolio" },
      { name: "description", content: "Caminho guiado em 3 passos para montar seu portfólio e pitch deck profissional." },
      { property: "og:title", content: "Criar portfólio — PitchFolio" },
      { property: "og:description", content: "Responda 3 perguntas e a IA estrutura seu portfólio e pitch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Criar,
});

const STEPS = ["Quem é você?", "Seu projeto de maior impacto", "Habilidades e próximo passo"];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">{label}</Label>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function Criar() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<RawAnswers>(EMPTY_ANSWERS);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const navigate = useNavigate();
  const structure = useServerFn(structurePortfolio);
  const extract = useServerFn(extractResume);

  useEffect(() => {
    const saved = localStorage.getItem(ANSWERS_KEY);
    if (saved) try { setA({ ...EMPTY_ANSWERS, ...JSON.parse(saved) }); } catch { /* ignore */ }
    const sp = new URLSearchParams(window.location.search);
    const s = Number(sp.get("step"));
    if (s === 1 || s === 2) setStep(s);
    if (sp.get("paste") === "1") setPasteOpen(true);
    if (sp.get("loading") === "1") setLoading(true);
  }, []);
  useEffect(() => { localStorage.setItem(ANSWERS_KEY, JSON.stringify(a)); }, [a]);

  const set = (k: keyof RawAnswers) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setA((s) => ({ ...s, [k]: e.target.value }));

  const valid = [
    a.name.trim() && a.area.trim() && a.bio.trim(),
    a.challenge.trim() && a.action.trim() && a.result.trim(),
    splitSkills(a.skills).length >= 3 && a.goal.trim(),
  ][step];

  async function importPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return void toast.error("O PDF deve ter no máximo 5 MB.");
    setImporting(true);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      const { answers, error } = await extract({ data: { filename: file.name, base64: btoa(bin) } });
      if (!answers) return void toast.error(error ?? "Não foi possível ler o currículo.");
      setA((s) => {
        const next = { ...s };
        for (const [k, v] of Object.entries(answers)) if (v) next[k as keyof RawAnswers] = v;
        return next;
      });
      toast.success("Currículo importado! Revise os campos antes de gerar.");
    } catch {
      toast.error("Não foi possível ler o currículo agora.");
    } finally {
      setImporting(false);
    }
  }

  async function importPastedText() {
    const rawText = pasteText.trim();
    const githubUser = githubInput.trim();
    if (!githubUser && rawText.length < 20) {
      return void toast.error("Informe um usuário do GitHub ou cole o texto do seu LinkedIn / currículo.");
    }
    setImporting(true);
    try {
      const { answers, error } = await extract({
        data: {
          ...(githubUser ? { githubUser } : {}),
          ...(rawText.length >= 20 ? { rawText } : {}),
        },
      });
      if (!answers) return void toast.error(error ?? "Não foi possível extrair os dados.");
      setA((s) => {
        const next = { ...s };
        for (const [k, v] of Object.entries(answers)) if (v) next[k as keyof RawAnswers] = v;
        return next;
      });
      setPasteOpen(false);
      toast.success("Dados sincronizados com sucesso! Revise os passos antes de gerar.");
    } catch {
      toast.error("Não foi possível importar os dados agora.");
    } finally {
      setImporting(false);
    }
  }

  function fillDemo() {
    setA(DEMO_ANSWERS);
    toast.success("Exemplo fictício carregado! Você já pode avançar pelos passos ou gerar.");
  }

  async function generate() {
    setLoading(true);
    try {
      const { portfolio, deck, ai } = await structure({ data: a });
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ portfolio, deck, theme: "moderno" }));
      if (!ai) toast.message("Usamos a estruturação automática básica — você pode editar tudo.");
      navigate({ to: "/editor" });
    } catch {
      toast.error("Não foi possível gerar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
          <Sparkles className="h-9 w-9 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold">Estruturando seu portfólio…</h1>
        <p className="max-w-md text-muted-foreground">A IA está reescrevendo suas respostas com verbos de impacto e montando seus 5 slides.</p>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Logo />
        <span className="text-sm font-medium text-muted-foreground">Passo {step + 1} de 3</span>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-20">
        <div className="mb-8 flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
              <p className={`mt-2 hidden text-xs font-medium sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {i < step && <Check className="mr-1 inline h-3 w-3" />}{s}
              </p>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="mb-6 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-primary/50 bg-primary/5 p-4 transition hover:bg-primary/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  {importing ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileUp className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{importing ? "Lendo…" : "Importar PDF"}</p>
                  <p className="truncate text-xs text-muted-foreground">Currículo até 5 MB</p>
                </div>
                <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={importing} onChange={importPdf} aria-label="Importar currículo em PDF" />
              </label>

              <button
                type="button"
                disabled={importing}
                onClick={() => setPasteOpen((v) => !v)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Github className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">GitHub & LinkedIn</p>
                  <p className="truncate text-xs text-muted-foreground">Sincronizar perfil e repos</p>
                </div>
              </button>

              <button
                type="button"
                onClick={fillDemo}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Usar exemplo</p>
                  <p className="truncate text-xs text-muted-foreground">Dados fictícios (Demo)</p>
                </div>
              </button>
            </div>

            {pasteOpen && (
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Github className="h-4 w-4" /> Usuário ou link do GitHub (opcional)
                  </Label>
                  <p className="text-xs text-muted-foreground">Buscamos sua bio, linguagens mais usadas e seu repositório de maior destaque via GitHub API.</p>
                  <Input
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="ex: torvalds ou github.com/seu-usuario"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <ClipboardPaste className="h-4 w-4" /> Texto do LinkedIn ou currículo (opcional)
                  </Label>
                  <p className="text-xs text-muted-foreground">No LinkedIn, clique em "Mais → Salvar como PDF" (use o botão acima) ou cole sua seção Sobre e Experiências aqui.</p>
                  <Textarea
                    rows={4}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Cole aqui sua seção Sobre, experiências, projetos e habilidades…"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPasteOpen(false)}>Cancelar</Button>
                  <Button size="sm" disabled={importing || (!githubInput.trim() && pasteText.trim().length < 20)} onClick={importPastedText}>
                    {importing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                    Importar e resumir com IA
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold sm:text-4xl">{STEPS[step]}</h1>
          <div className="mt-8 space-y-6">
            {step === 0 && (
              <>
                <Field label="Nome completo"><Input value={a.name} onChange={set("name")} placeholder="Ana Souza" /></Field>
                <Field label="Área de atuação ou curso"><Input value={a.area} onChange={set("area")} placeholder="Engenharia de Software · UFPE" /></Field>
                <Field label="Resumo de perfil" hint="Conte em poucas linhas quem você é e o que te move.">
                  <Textarea rows={4} value={a.bio} onChange={set("bio")} placeholder="Sou estudante do 6º período, apaixonada por produtos que resolvem problemas reais…" />
                </Field>
              </>
            )}
            {step === 1 && (
              <>
                <Field label="Qual era o problema ou desafio?">
                  <Textarea rows={3} value={a.challenge} onChange={set("challenge")} placeholder="Alunos gastavam muito com transporte até o campus…" />
                </Field>
                <Field label="O que você fez na prática?">
                  <Textarea rows={3} value={a.action} onChange={set("action")} placeholder="Desenvolvi um app de caronas com React Native e organizei testes com 50 alunos…" />
                </Field>
                <Field label="Quais foram os resultados ou aprendizados?" hint="Números ajudam muito: usuários, %, tempo, prêmios.">
                  <Textarea rows={3} value={a.result} onChange={set("result")} placeholder="1.200 usuários em 4 meses, redução de 30% no custo médio…" />
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Top 3 a 5 habilidades" hint="Técnicas e interpessoais, separadas por vírgula.">
                  <Input value={a.skills} onChange={set("skills")} placeholder="React, Python, Liderança, Comunicação, SQL" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="LinkedIn"><Input value={a.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/…" /></Field>
                  <Field label="GitHub"><Input value={a.github} onChange={set("github")} placeholder="github.com/…" /></Field>
                  <Field label="E-mail"><Input type="email" value={a.email} onChange={set("email")} placeholder="voce@email.com" /></Field>
                </div>
                <Field label="Objetivo profissional">
                  <Textarea rows={3} value={a.goal} onChange={set("goal")} placeholder="Busco estágio em desenvolvimento front-end em uma startup de impacto…" />
                </Field>
              </>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <Button variant="ghost" onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            {step < 2 ? (
              <Button size="lg" className="rounded-full" disabled={!valid} onClick={() => setStep(step + 1)}>
                Continuar <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button size="lg" className="rounded-full" disabled={!valid} onClick={generate}>
                <Sparkles className="mr-1 h-4 w-4" /> Gerar com IA
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
