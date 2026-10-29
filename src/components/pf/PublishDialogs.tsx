import { useEffect, useState } from "react";
import { Copy, Linkedin, MessageCircle, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authSchema } from "@/validators/portfolio";
import { signupSchema } from "@/validators/profile";
import { buildShareUrls } from "@/lib/share";
import { fireConfetti } from "./Confetti";

export function AuthDialog({ open, onOpenChange, onAuthed }: { open: boolean; onOpenChange: (o: boolean) => void; onAuthed: () => void }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        // Validate on the client for instant feedback; the server validates again.
        const parsed = signupSchema.safeParse({ email, password, first_name: firstName, last_name: lastName, phone_number: phone });
        if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos."); return; }
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string; confirmation_required?: boolean };
        if (!res.ok) { toast.error(body.error ?? "Não foi possível criar a conta."); return; }
        if (body.confirmation_required) { setPending(true); return; }
        const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
        if (error) throw error;
      } else {
        const credentials = authSchema.parse({ email, password });
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
      }
      onAuthed();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos." : msg.includes("Email not confirmed") ? "Confirme seu e-mail antes de entrar." : "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Publicar portfólio</DialogTitle>
          <DialogDescription>Crie sua conta para salvar e gerar seu link público.</DialogDescription>
        </DialogHeader>
        {pending ? (
          <div className="space-y-4 py-2">
            <p>Enviamos um link de confirmação para <b>{email}</b>. Confirme seu e-mail e depois entre aqui para publicar — seu rascunho fica salvo.</p>
            <Button className="w-full" variant="outline" onClick={() => { setPending(false); setMode("signin"); }}>Já confirmei, entrar</Button>
          </div>
        ) : (
          <>
            <Tabs value={mode} onValueChange={(v) => setMode(v as "signup" | "signin")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
                <TabsTrigger value="signin">Já tenho conta</TabsTrigger>
              </TabsList>
            </Tabs>
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Nome</Label><Input required maxLength={60} autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Sobrenome</Label><Input required maxLength={60} autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                  </div>
                  <div className="space-y-2"><Label>Telefone</Label><Input required type="tel" autoComplete="tel" placeholder="+55 11 98765-4321" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                </>
              )}
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" required minLength={mode === "signup" ? 8 : 6} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                {mode === "signup" && <p className="text-[11px] text-muted-foreground">8+ caracteres com maiúscula, minúscula, número e símbolo.</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "signup" ? "Criar conta e publicar" : "Entrar e publicar"}
              </Button>
            </form>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Credenciais de Teste (Edital):</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setEmail("demo@pitchfolio.app");
                    setPassword("DemoUser2026!");
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  Preencher dados
                </button>
              </div>
              <p className="mt-1 font-mono text-[11px] text-foreground/80">demo@pitchfolio.app · DemoUser2026!</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ShareDialog({ open, onOpenChange, url, name }: { open: boolean; onOpenChange: (o: boolean) => void; url: string; name: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      fireConfetti();
    }
  }, [open]);

  const { absoluteUrl, isLocal, whatsappUrl, linkedinUrl } = buildShareUrls(url, name);
  const qrSrc = absoluteUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(absoluteUrl)}` : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const win = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!win) {
      window.location.href = whatsappUrl;
    }
  };

  const handleShareLinkedIn = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLocal) {
      toast.info("Ambiente local: adaptamos o link para prévia pública no LinkedIn.");
    }
    const win = window.open(linkedinUrl, "_blank", "noopener,noreferrer");
    if (!win) {
      window.location.href = linkedinUrl;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Seu portfólio está no ar!</DialogTitle>
          <DialogDescription>Compartilhe seu link ou mostre o QR Code em entrevistas e feiras de carreira.</DialogDescription>
        </DialogHeader>

        {absoluteUrl && (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4">
            <img
              src={qrSrc}
              alt="QR Code do portfólio"
              width={96}
              height={96}
              className="h-24 w-24 shrink-0 rounded-xl border border-border bg-white p-1"
            />
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-[11px] font-semibold text-primary">Cartão de Pitch Digital</p>
              <p className="truncate font-display text-lg font-bold">{name || "Meu Portfólio"}</p>
              <p className="text-xs text-muted-foreground">Aponte a câmera do celular para abrir o site ou navegar pelos 5 slides.</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input readOnly value={absoluteUrl} onFocus={(e) => e.target.select()} />
          <Button variant="outline" onClick={handleCopy} title="Copiar link">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            asChild
            variant="secondary"
            className="cursor-pointer transition hover:bg-[#25D366]/15 hover:text-[#25D366] hover:border-[#25D366]/30"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </a>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="cursor-pointer transition hover:bg-[#0A66C2]/15 hover:text-[#0A66C2] hover:border-[#0A66C2]/30"
          >
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              onClick={handleShareLinkedIn}
            >
              <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
            </a>
          </Button>
        </div>
        <Button asChild className="w-full">
          <a href={absoluteUrl} target="_blank" rel="noreferrer">
            Abrir página pública
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
