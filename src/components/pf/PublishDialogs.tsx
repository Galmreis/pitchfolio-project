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

  const text = `Confira meu portfólio e pitch deck profissional${name ? ` (${name})` : ""}: ${url}`;
  const qrSrc = url ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(url)}` : "";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Seu portfólio está no ar!</DialogTitle>
          <DialogDescription>Compartilhe seu link ou mostre o QR Code em entrevistas e feiras de carreira.</DialogDescription>
        </DialogHeader>

        {url && (
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
          <Input readOnly value={url} onFocus={(e) => e.target.select()} />
          <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); toast.success("Link copiado!"); setTimeout(() => setCopied(false), 2000); }}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="secondary">
            <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</a>
          </Button>
          <Button asChild variant="secondary">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</a>
          </Button>
        </div>
        <Button asChild><a href={url} target="_blank" rel="noreferrer">Abrir página pública</a></Button>
      </DialogContent>
    </Dialog>
  );
}
