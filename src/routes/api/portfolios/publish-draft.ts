import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/portfolios/publish-draft")({
  server: { handlers: {
    POST: async ({ request }) => {
      try {
        const { authenticateRequest } = await import("@/middlewares/auth.server");
        const { publishDraft } = await import("@/services/publish.server");
        const { client } = await authenticateRequest(request);
        if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Envie JSON." }, { status: 415 });
        // Read a bounded stream; Content-Length alone is attacker-controlled.
        const reader = request.body?.getReader();
        if (!reader) return Response.json({ error: "Rascunho ausente." }, { status: 400 });
        const chunks: Uint8Array[] = [];
        let size = 0;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 50000) { await reader.cancel(); return Response.json({ error: "Rascunho muito grande." }, { status: 413 }); }
          chunks.push(value);
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        const input: unknown = JSON.parse(new TextDecoder().decode(bytes));
        return Response.json(await publishDraft(client, input, new URL(request.url).origin), { headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") return Response.json({ error: "Entre para publicar." }, { status: 401 });
        return Response.json({ error: "Rascunho inválido ou publicação indisponível." }, { status: 400 });
      }
    },
  } },
});