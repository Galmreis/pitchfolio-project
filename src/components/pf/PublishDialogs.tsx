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
import { fireConfetti } from "./Confetti";

export function AuthDialog({ open, onOpenChange, onAuthed }: { open: boolean; onOpenChange: (o: boolean) => void; onAuthed: () => void }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const credentials = authSchema.parse({ email, password });
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          ...credentials, options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) { setPending(true); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
      }
      onAuthed();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos." : msg || "Algo deu errado.");
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
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Senha</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
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
