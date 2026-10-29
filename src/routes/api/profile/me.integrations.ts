import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/profile/me/integrations")({
  server: { handlers: {
    PATCH: async ({ request }) => {
      const { readJson, toResponse } = await import("@/controllers/profile.controller");
      try {
        const { authenticateRequest } = await import("@/middlewares/auth.server");
        const { updateIntegrations } = await import("@/services/profile.server");
        const { client, userId } = await authenticateRequest(request);
        return Response.json(await updateIntegrations(client, userId, await readJson(request, 2000)), { headers: { "Cache-Control": "no-store" } });
      } catch (error) { return toResponse(error); }
    },
  } },
});
