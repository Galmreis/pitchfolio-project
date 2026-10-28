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

const BIO_STARTERS = [
  { label: "+ 1º Estágio / Júnior", text: "Estudante em busca do primeiro estágio, com base prática em projetos acadêmicos e facilidade para aprender rápido em equipe." },
  { label: "+ Transição de carreira", text: "Profissional em transição de carreira, trazendo experiência prévia em resolução de problemas e foco prático na nova área." },
  { label: "+ Foco em projetos práticos", text: "Desenvolvedor(a) em formação que aprende construindo soluções reais para problemas do dia a dia no campus e na comunidade." },
];

const CHALLENGE_STARTERS = [
  { label: "+ Processo manual lento", text: "Colegas e equipes perdiam muito tempo organizando informações manualmente em planilhas desconectadas." },
  { label: "+ Problema no campus / curso", text: "Alunos do curso enfrentavam dificuldade para acompanhar demandas e compartilhar materiais de forma centralizada." },
  { label: "+ Projeto de disciplina / TCC", text: "Durante um projeto prático da graduação, precisávamos validar uma solução funcional com prazo curto e recursos limitados." },
];

const ACTION_STARTERS = [
  { label: "+ Criei protótipo / sistema", text: "Desenvolvi uma aplicação web do zero, estruturei o banco de dados e testei o fluxo com usuários reais." },
  { label: "+ Liderei a organização", text: "Organizei a divisão de tarefas da equipe, documentei o processo e construí os principais fluxos da solução." },
  { label: "+ Automatizei tarefas", text: "Implementei um fluxo automatizado para centralizar os dados e eliminar o retrabalho manual da equipe." },
];

const RESULT_STARTERS = [
  { label: "+ Redução de tempo", text: "Reduzi o tempo gasto na tarefa em cerca de 40% e facilitei a rotina de mais de 30 pessoas." },
  { label: "+ Nota máxima / Destaque", text: "O projeto recebeu nota máxima da banca avaliadora e passou a ser utilizado como referência pelos alunos." },
  { label: "+ Primeiros usuários", text: "Alcancei os primeiros 50 usuários ativos nas primeiras semanas e validei a solução na prática." },
];

const SKILL_SUGGESTIONS = [
  "Comunicação", "Resolução de Problemas", "Trabalho em Equipe", "Proatividade",
  "JavaScript", "TypeScript", "React", "Python", "SQL", "Git", "Figma", "Excel", "Inglês",
];

const GOAL_STARTERS = [
  { label: "+ Estágio / 1º Emprego", text: "Busco minha primeira oportunidade de estágio ou posição júnior para aplicar minha base técnica e evoluir junto ao time." },
  { label: "+ Trainee / Júnior", text: "Procuro atuar como pessoa desenvolvedora júnior ou trainee em projetos onde eu possa gerar impacto rápido e aprender com mentores." },
];

function StarterChips({ items, onSelect }: { items: { label: string; text: string }[]; onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-[11px] font-medium text-muted-foreground mr-1">Não sabe como começar? Clique para usar um modelo:</span>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item.text)}
          className="rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition hover:border-primary/50 hover:bg-primary/10"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

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

  const toggleSkill = (skill: string) => {
    const current = splitSkills(a.skills);
    const exists = current.some((s) => s.toLowerCase() === skill.toLowerCase());
    const next = exists ? current.filter((s) => s.toLowerCase() !== skill.toLowerCase()) : [...current, skill];
    setA((s) => ({ ...s, skills: next.join(", ") }));
  };

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
        <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-8 w-8 animate-pulse" />
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

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl">{STEPS[step]}</h1>
            {step === 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15">
                  {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
                  {importing ? "Lendo…" : "Importar PDF"}
                  <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={importing} onChange={importPdf} aria-label="Importar currículo em PDF" />
                </label>

                <button
                  type="button"
                  disabled={importing}
                  onClick={() => setPasteOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub / LinkedIn
                </button>

                <button
                  type="button"
                  onClick={fillDemo}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <Wand2 className="h-3.5 w-3.5 text-primary" /> Usar exemplo
                </button>
              </div>
            )}
          </div>

          {step === 0 && pasteOpen && (
            <div className="mt-5 space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
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

          <div className="mt-8 space-y-6">
            {step === 0 && (
              <>
                <Field label="Nome completo"><Input value={a.name} onChange={set("name")} placeholder="Ana Souza" /></Field>
                <Field label="Área de atuação ou curso"><Input value={a.area} onChange={set("area")} placeholder="Engenharia de Software · UFPE" /></Field>
                <Field label="Resumo de perfil" hint="Conte em poucas linhas quem você é e o que te move. Não precisa ser formal — a IA lapida o texto depois.">
                  <Textarea rows={4} value={a.bio} onChange={set("bio")} placeholder="Sou estudante do 6º período, apaixonada por produtos que resolvem problemas reais…" />
                  <StarterChips items={BIO_STARTERS} onSelect={(text) => setA((s) => ({ ...s, bio: text }))} />
                </Field>
              </>
            )}
            {step === 1 && (
              <>
                <div className="rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-foreground">
                  <strong className="font-semibold text-primary">Ainda não teve emprego formal?</strong> Tudo bem! Use um trabalho de disciplina, TCC, iniciação científica, empresa júnior, hackathon ou projeto pessoal. O que importa é mostrar como você resolve problemas (Método STAR).
                </div>
                <Field label="Qual era o problema ou desafio? (Situação / Tarefa)">
                  <Textarea rows={3} value={a.challenge} onChange={set("challenge")} placeholder="Alunos gastavam muito com transporte até o campus…" />
                  <StarterChips items={CHALLENGE_STARTERS} onSelect={(text) => setA((s) => ({ ...s, challenge: text }))} />
                </Field>
                <Field label="O que você fez na prática? (Ação)">
                  <Textarea rows={3} value={a.action} onChange={set("action")} placeholder="Desenvolvi um app de caronas com React Native e organizei testes com 50 alunos…" />
                  <StarterChips items={ACTION_STARTERS} onSelect={(text) => setA((s) => ({ ...s, action: text }))} />
                </Field>
                <Field label="Quais foram os resultados ou aprendizados? (Resultado)" hint="Números ajudam muito: usuários, %, tempo economizado, nota ou entregas.">
                  <Textarea rows={3} value={a.result} onChange={set("result")} placeholder="1.200 usuários em 4 meses, redução de 30% no custo médio…" />
                  <StarterChips items={RESULT_STARTERS} onSelect={(text) => setA((s) => ({ ...s, result: text }))} />
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Top 3 a 5 habilidades" hint="Clique nas sugestões abaixo ou digite as suas separadas por vírgula.">
                  <Input value={a.skills} onChange={set("skills")} placeholder="React, Python, Liderança, Comunicação, SQL" />
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {SKILL_SUGGESTIONS.map((skill) => {
                      const active = splitSkills(a.skills).some((s) => s.toLowerCase() === skill.toLowerCase());
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {active ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="LinkedIn"><Input value={a.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/…" /></Field>
                  <Field label="GitHub"><Input value={a.github} onChange={set("github")} placeholder="github.com/…" /></Field>
                  <Field label="E-mail"><Input type="email" value={a.email} onChange={set("email")} placeholder="voce@email.com" /></Field>
                </div>
                <Field label="Objetivo profissional" hint="O que você busca agora? (Estágio, 1º emprego, trainee, freelancer)">
                  <Textarea rows={3} value={a.goal} onChange={set("goal")} placeholder="Busco estágio em desenvolvimento front-end em uma startup de impacto…" />
                  <StarterChips items={GOAL_STARTERS} onSelect={(text) => setA((s) => ({ ...s, goal: text }))} />
                </Field>
              </>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <Button variant="ghost" onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            {step < 2 ? (
              <Button size="lg" className="rounded-lg" disabled={!valid} onClick={() => setStep(step + 1)}>
                Continuar <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button size="lg" className="rounded-lg" disabled={!valid} onClick={generate}>
                <Sparkles className="mr-1 h-4 w-4" /> Gerar com IA
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
