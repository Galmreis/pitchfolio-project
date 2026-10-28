import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/portfolios/$portfolioId/curation")({
  server: { handlers: {
    PATCH: async ({ request, params }) => {
      const noStore = { "Cache-Control": "no-store" };
      try {
        const { authenticateRequest } = await import("@/middlewares/auth.server");
        const { applyCuration } = await import("@/controllers/portfolioCuration.controller");
        const { client } = await authenticateRequest(request);
        const text = await request.text();
        if (text.length > 100000) return Response.json({ error: "Requisição muito grande." }, { status: 413 });
        const body: unknown = JSON.parse(text);
        return Response.json(await applyCuration(client, params.portfolioId, body), { headers: noStore });
      } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") return Response.json({ error: "Entre para editar." }, { status: 401, headers: noStore });
        const { CurationError } = await import("@/controllers/portfolioCuration.controller");
        if (error instanceof CurationError) return Response.json({ error: error.message }, { status: error.status, headers: noStore });
        return Response.json({ error: "Dados inválidos." }, { status: 400, headers: noStore });
      }
    },
  } },
});
