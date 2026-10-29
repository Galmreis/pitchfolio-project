import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Globe,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Pencil,
  Plus,
  Presentation,
  QrCode,
  Rocket,
  Save,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listOwnedPortfolios } from "@/controllers/portfolios.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/pf/Logo";
import { AuthDialog, ShareDialog } from "@/components/pf/PublishDialogs";
import {
  AVATAR_PRESETS,
  DRAFT_KEY,
  THEMES,
  normalizeUrl,
  type Draft,
  type Portfolio,
} from "@/lib/portfolio";
import { portfolioSchema } from "@/validators/portfolio";
import { githubUrlSchema, linkedinUrlSchema, phoneSchema } from "@/validators/profile";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil e Dossiês — PitchFolio" },
      { name: "description", content: "Gerencie sua conta, canais de contato e portfólios no PitchFolio." },
      { property: "og:title", content: "Meu Perfil — PitchFolio" },
      { property: "og:description", content: "Painel do candidato: gerencie seus dossiês STAR e pitch decks de 5 slides." },
    ],
  }),
  component: PerfilPage,
});

interface UserProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
}

interface PortfolioItemSummary {
  id: string;
  slug: string;
  name: string;
  isPublished: boolean;
  selectedTheme: string;
  data: Portfolio;
  updatedAt?: string;
}

function PerfilPage() {
  const navigate = useNavigate();
  const listOwned = useServerFn(listOwnedPortfolios);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfileData>({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    fullName: "",
    phoneNumber: "",
    avatarUrl: "",
  });
  const [contacts, setContacts] = useState({
    linkedin: "",
    github: "",
    phone: "",
    contactEmail: "",
  });
  const [portfolios, setPortfolios] = useState<PortfolioItemSummary[]>([]);
  const [localDraft, setLocalDraft] = useState<Draft | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  useEffect(() => {
    // Read local draft if present
    const rawDraft = localStorage.getItem(DRAFT_KEY);
    if (rawDraft) {
      try {
        setLocalDraft(JSON.parse(rawDraft));
      } catch {
        // ignore invalid draft
      }
    }

    loadUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        loadUserData();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setPortfolios([]);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadUserData() {
    setLoading(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({ id: authUser.id, email: authUser.email ?? "" });

      // 1. Fetch user profile from public.profiles
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, full_name, phone_number, avatar_url, linkedin_url, github_url")
        .eq("id", authUser.id)
        .maybeSingle();

      const firstName = profileRow?.first_name || (authUser.user_metadata?.['first_name'] as string | undefined) || "";
      const lastName = profileRow?.last_name || (authUser.user_metadata?.['last_name'] as string | undefined) || "";
      const fullName =
        profileRow?.full_name ||
        [firstName, lastName].filter(Boolean).join(" ") ||
        (authUser.user_metadata?.['full_name'] as string | undefined) ||
        "";
      const phoneNumber = profileRow?.phone_number || (authUser.user_metadata?.['phone_number'] as string | undefined) || "";
      const avatarUrl = profileRow?.avatar_url || (authUser.user_metadata?.['avatar_url'] as string | undefined) || "";

      setProfile({
        id: authUser.id,
        email: authUser.email ?? "",
        firstName,
        lastName,
        fullName,
        phoneNumber,
        avatarUrl,
      });

      if (profileRow?.linkedin_url || profileRow?.github_url || profileRow?.phone_number) {
        setContacts((c) => ({
          ...c,
          linkedin: profileRow.linkedin_url || c.linkedin,
          github: profileRow.github_url || c.github,
          phone: profileRow.phone_number || c.phone,
        }));
      }

      // 2. Fetch user's portfolios
      try {
        const owned = await listOwned();
        if (owned && Array.isArray(owned)) {
          const validList: PortfolioItemSummary[] = [];
          for (const item of owned) {
            const parsed = portfolioSchema.safeParse(item.data);
            if (parsed.success) {
              validList.push({
                id: item.id,
                slug: item.slug,
                name: item.name || parsed.data.name,
                isPublished: Boolean(item.is_published),
                selectedTheme: item.selected_theme || "moderno",
                data: parsed.data,
              });
            }
          }
          setPortfolios(validList);

          // Pre-fill contacts from latest portfolio if available
          if (validList.length > 0) {
            const latest = validList[0]!.data;
            setContacts((c) => ({
              ...c,
              linkedin: latest.linkedin || c.linkedin,
              github: latest.github || c.github,
              contactEmail: latest.email || authUser.email || c.contactEmail,
            }));
            if (!avatarUrl && latest.avatarUrl) {
              setProfile((p) => ({ ...p, avatarUrl: latest.avatarUrl ?? "" }));
            }
            if (!fullName && latest.name) {
              setProfile((p) => ({ ...p, fullName: latest.name }));
            }
          }
        }
      } catch {
        // Fallback: direct query through client RLS
        const { data: directRows } = await supabase
          .from("portfolios")
          .select("id, slug, name, is_published, selected_theme, data, updated_at")
          .eq("user_id", authUser.id)
          .order("updated_at", { ascending: false });

        if (directRows && directRows.length > 0) {
          const validList: PortfolioItemSummary[] = [];
          for (const item of directRows) {
            const parsed = portfolioSchema.safeParse(item.data);
            if (parsed.success) {
              validList.push({
                id: item.id,
                slug: item.slug,
                name: item.name || parsed.data.name,
                isPublished: Boolean(item.is_published),
                selectedTheme: item.selected_theme || "moderno",
                data: parsed.data,
                updatedAt: item.updated_at,
              });
            }
          }
          setPortfolios(validList);

          if (validList.length > 0) {
            const latest = validList[0]!.data;
            setContacts((c) => ({
              ...c,
              linkedin: latest.linkedin || c.linkedin,
              github: latest.github || c.github,
              contactEmail: latest.email || authUser.email || c.contactEmail,
            }));
          }
        }
      }
    } catch (e) {
      console.error("Error loading user profile", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    let normalizedPhone = "";
    if (contacts.phone.trim()) {
      const phoneCheck = phoneSchema.safeParse(contacts.phone.trim());
      if (!phoneCheck.success) {
        toast.error("Telefone inválido. Use um formato como (11) 98765-4321 ou +55 11 98765-4321.");
        return;
      }
      normalizedPhone = phoneCheck.data;
    }

    let normalizedLinkedin: string | null = null;
    if (contacts.linkedin.trim()) {
      const check = linkedinUrlSchema.safeParse(contacts.linkedin.trim());
      if (!check.success) {
        toast.error("LinkedIn inválido. Use linkedin.com/in/seu-perfil.");
        return;
      }
      normalizedLinkedin = check.data;
    }

    let normalizedGithub: string | null = null;
    if (contacts.github.trim()) {
      const check = githubUrlSchema.safeParse(contacts.github.trim());
      if (!check.success) {
        toast.error("GitHub inválido. Use github.com/seu-usuario.");
        return;
      }
      normalizedGithub = check.data;
    }

    setSaving(true);
    try {
      const trimmedFirst = profile.firstName.trim();
      const trimmedLast = profile.lastName.trim();
      const derivedFull = [trimmedFirst, trimmedLast].filter(Boolean).join(" ") || profile.fullName.trim();

      // 1. Update public.profiles (triggers DB function sync_profile_to_portfolio)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: trimmedFirst || derivedFull.split(" ")[0] || "",
          last_name: trimmedLast || derivedFull.split(" ").slice(1).join(" ") || "",
          full_name: derivedFull.slice(0, 120),
          phone_number: normalizedPhone,
          linkedin_url: normalizedLinkedin,
          github_url: normalizedGithub,
          avatar_url: profile.avatarUrl.trim() || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 2. Also update local draft in browser if present
      if (localDraft) {
        const updatedLocalDraft: Draft = {
          ...localDraft,
          portfolio: {
            ...localDraft.portfolio,
            name: derivedFull || localDraft.portfolio.name,
            avatarUrl: profile.avatarUrl.trim() || localDraft.portfolio.avatarUrl,
            linkedin: normalizedLinkedin || contacts.linkedin.trim(),
            github: normalizedGithub || contacts.github.trim(),
            email: contacts.contactEmail.trim(),
          },
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(updatedLocalDraft));
        setLocalDraft(updatedLocalDraft);
      }

      toast.success("Perfil e contatos sincronizados com sucesso!");
      await loadUserData();
    } catch (err) {
      console.error("Error saving profile", err);
      toast.error("Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.message("Você saiu da conta.");
    navigate({ to: "/" });
  }

  const initials =
    (profile.fullName || user?.email || "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "PF";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/instituicoes">Para Instituições</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/editor">Editor</Link>
          </Button>
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-lg">
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sair
            </Button>
          ) : (
            <Button size="sm" onClick={() => setAuthOpen(true)} className="rounded-lg">
              <LogIn className="mr-1.5 h-3.5 w-3.5" /> Entrar
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-4">
        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando painel do candidato…</p>
          </div>
        ) : !user ? (
          /* Unauthenticated State */
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserIcon className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Painel do Candidato</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Acesse sua conta para visualizar seus dossiês STAR, sincronizar suas informações de contato e gerenciar seus links públicos de pitch.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button size="lg" onClick={() => setAuthOpen(true)} className="w-full rounded-lg">
                <LogIn className="mr-2 h-4 w-4" /> Entrar ou Criar Conta
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full rounded-lg">
                <Link to="/criar">
                  Criar novo dossiê sem cadastro <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-8">
            {/* Candidate Header Ledger */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || "Foto de perfil"}
                    className="h-16 w-16 rounded-2xl border border-border object-cover shadow-xs"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground shadow-xs">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-foreground">
                      {profile.fullName || "Candidato(a)"}
                    </h1>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Conta Ativa
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-lg">
                  <Link to="/editor">
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Abrir no Editor
                  </Link>
                </Button>
                <Button asChild size="sm" className="rounded-lg">
                  <Link to="/criar">
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Novo Dossiê
                  </Link>
                </Button>
              </div>
            </div>

            {/* Local Draft Notice */}
            {localDraft && !portfolios.some((p) => p.slug === localDraft.slug) && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <strong className="font-semibold text-foreground">
                      Rascunho local disponível ({localDraft.portfolio.name || "Seu projeto"})
                    </strong>
                    <p className="text-muted-foreground">
                      Você possui edições salvas neste navegador prontas para publicação com a sua conta.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="rounded-lg">
                  <Link to="/editor">Revisar e Publicar</Link>
                </Button>
              </div>
            )}

            {/* Split Grid: Profile Settings + Portfolios / Decks List */}
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1.3fr]">
              {/* Column 1: Identity & Synchronized Contact Information */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
                  <div className="border-b border-border pb-3">
                    <span className="font-mono text-xs font-bold text-primary">01 / IDENTIDADE</span>
                    <h2 className="mt-1 font-display text-lg font-bold">Dados do Perfil</h2>
                    <p className="text-xs text-muted-foreground">
                      Seu nome e foto sincronizam com os cabeçalhos de todos os seus portfólios.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Nome</Label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfile((p) => ({
                            ...p,
                            firstName: val,
                            fullName: [val, p.lastName].filter(Boolean).join(" "),
                          }));
                        }}
                        placeholder="ex: Ana"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Sobrenome</Label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfile((p) => ({
                            ...p,
                            lastName: val,
                            fullName: [p.firstName, val].filter(Boolean).join(" "),
                          }));
                        }}
                        placeholder="ex: Souza"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">E-mail da Conta (Autenticação)</Label>
                    <Input value={profile.email} disabled className="opacity-70" />
                    <p className="text-[11px] text-muted-foreground">O e-mail de acesso não pode ser alterado diretamente.</p>
                  </div>

                  {/* Avatar & Preset Selector */}
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold">Foto / Ícone de Perfil</Label>
                    <Input
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
                      placeholder="Cole o link da sua foto (https://…)"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-muted-foreground mr-1">Ou use um preset:</span>
                      {AVATAR_PRESETS.map((ap) => (
                        <button
                          key={ap.url}
                          type="button"
                          onClick={() => {
                            setSelectedPreset(ap.url);
                            setProfile((p) => ({ ...p, avatarUrl: ap.url }));
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition ${
                            profile.avatarUrl === ap.url
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <img src={ap.url} alt={ap.label} className="h-4 w-4 rounded-full object-cover" />
                          {ap.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 1 (Bottom): Contact Synchronization */}
                <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-xs">
                  <div className="border-b border-border pb-3">
                    <span className="font-mono text-xs font-bold text-primary">02 / CANAIS DE CONTATO</span>
                    <h2 className="mt-1 font-display text-lg font-bold">Contatos Sincronizados</h2>
                    <p className="text-xs text-muted-foreground">
                      Aparecem no rodapé do seu Dossiê Web e no <strong>Slide 5 (Contato)</strong> da sua apresentação executiva.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">WhatsApp / Telefone de Contato</Label>
                    <Input
                      value={contacts.phone}
                      onChange={(e) => setContacts((c) => ({ ...c, phone: e.target.value }))}
                      placeholder="+55 11 98765-4321"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Perfil do LinkedIn</Label>
                    <Input
                      value={contacts.linkedin}
                      onChange={(e) => setContacts((c) => ({ ...c, linkedin: e.target.value }))}
                      placeholder="linkedin.com/in/seu-perfil"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">GitHub ou Portfólio Externo</Label>
                    <Input
                      value={contacts.github}
                      onChange={(e) => setContacts((c) => ({ ...c, github: e.target.value }))}
                      placeholder="github.com/seu-usuario ou seu-site.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">E-mail Público para Recrutadores</Label>
                    <Input
                      type="email"
                      value={contacts.contactEmail}
                      onChange={(e) => setContacts((c) => ({ ...c, contactEmail: e.target.value }))}
                      placeholder="contato@seunome.com"
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full rounded-lg">
                    {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                    Sincronizar Perfil & Contatos
                  </Button>
                </div>
              </form>

              {/* Column 2: Decks & Portfolios Ledger */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">03 / ATIVOS DIGITAIS</span>
                    <h2 className="mt-1 font-display text-lg font-bold">Meus Dossiês & Pitch Decks</h2>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {portfolios.length} {portfolios.length === 1 ? "ativo" : "ativos"}
                  </span>
                </div>

                {portfolios.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm font-medium text-foreground">Nenhum portfólio publicado na nuvem ainda.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Crie seu dossiê no Método STAR e publique para gerar seu link permanente e cartão QR.
                    </p>
                    <Button asChild size="sm" className="mt-4 rounded-lg">
                      <Link to="/criar">
                        Criar meu 1º Dossiê <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {portfolios.map((item) => {
                      const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${item.slug}`;
                      return (
                        <article
                          key={item.id}
                          className="rounded-xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40 space-y-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-display text-base font-bold text-foreground">
                                  {item.data.projectTitle || item.name}
                                </h3>
                                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                  Publicado
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.data.role}</p>
                            </div>

                            <span className="rounded border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Tema {item.selectedTheme}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              Caso STAR · {item.data.projectTitle}
                            </span>
                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {item.data.result || item.data.bio}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Button asChild variant="outline" size="sm" className="rounded-lg text-xs">
                                <Link to="/p/$slug" params={{ slug: item.slug }}>
                                  <Globe className="mr-1 h-3.5 w-3.5" /> Dossiê
                                </Link>
                              </Button>
                              <Button asChild variant="outline" size="sm" className="rounded-lg text-xs">
                                <Link to="/p/$slug" params={{ slug: item.slug }} search={{ view: "deck" }}>
                                  <Presentation className="mr-1 h-3.5 w-3.5" /> 5 Slides
                                </Link>
                              </Button>
                              <Button asChild size="sm" className="rounded-lg text-xs">
                                <Link to="/editor">
                                  <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                                </Link>
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShareUrl(publicUrl)}
                              className="rounded-lg text-xs"
                            >
                              <QrCode className="mr-1 h-3.5 w-3.5" /> QR Code
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => loadUserData()} />
      <ShareDialog open={!!shareUrl} onOpenChange={(o) => !o && setShareUrl(null)} url={shareUrl ?? ""} name={profile.fullName} />
    </div>
  );
}