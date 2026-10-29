import { ZodError } from "zod";

/** Shared helpers for /api/profile routes: bounded JSON body + error mapping. */
export async function readJson(request: Request, maxBytes: number): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Envie JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Corpo ausente.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new HttpError(413, "Requisição muito grande."); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) { bytes.set(c, offset); offset += c.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new HttpError(400, "JSON inválido."); }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const STATUS = { NOT_FOUND: 404, CONFLICT: 409, INVALID: 400, LIMIT: 429, FAILED: 500 } as const;

export async function toResponse(error: unknown): Promise<Response> {
  const { ProfileError } = await import("@/services/profile.server");
  const noStore = { "Cache-Control": "no-store" };
  if (error instanceof Error && error.message === "UNAUTHORIZED") return Response.json({ error: "Entre na sua conta." }, { status: 401, headers: noStore });
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status, headers: noStore });
  if (error instanceof ZodError) return Response.json({ error: "Dados inválidos.", fields: Object.fromEntries(error.issues.map((i) => [i.path.join("."), i.message])) }, { status: 400, headers: noStore });
  if (error instanceof ProfileError) return Response.json({ error: error.message }, { status: STATUS[error.code], headers: noStore });
  if (error instanceof Error && /tamanho|corresponde/.test(error.message)) return Response.json({ error: error.message }, { status: 400, headers: noStore });
  return Response.json({ error: "Erro inesperado." }, { status: 500, headers: noStore });
}
