import { z } from "zod";
import { LIMITS } from "@/config/limits";

export const uploadSchema = z.object({
  bucket: z.enum(["resumes", "avatars", "published_pdfs"]),
  filename: z.string().min(1).max(120).regex(/^[a-zA-Z0-9._-]+$/),
  contentType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(4).max(Math.ceil(LIMITS.pdfBytes / 3) * 4).regex(/^[A-Za-z0-9+/]+={0,2}$/),
}).strict();

export function validateUpload(input: unknown) {
  const data = uploadSchema.parse(input);
  const raw = atob(data.base64);
  const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
  const maximum = data.bucket === "avatars" ? LIMITS.avatarBytes : data.bucket === "resumes" ? LIMITS.resumeBytes : LIMITS.pdfBytes;
  if (!bytes.length || bytes.length > maximum) throw new Error("Arquivo excede o tamanho permitido.");
  const prefix = Array.from(bytes.slice(0, 12));
  const pdf = raw.startsWith("%PDF-");
  const jpg = prefix[0] === 255 && prefix[1] === 216 && prefix[2] === 255;
  const png = prefix.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
  const webp = raw.startsWith("RIFF") && raw.slice(8, 12) === "WEBP";
  const matches = data.contentType === "application/pdf" ? pdf : data.contentType === "image/jpeg" ? jpg : data.contentType === "image/png" ? png : webp;
  if (!matches || (data.bucket === "avatars" ? pdf : !pdf)) throw new Error("O conteúdo do arquivo não corresponde ao tipo permitido.");
  return { ...data, bytes };
}