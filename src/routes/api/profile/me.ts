import { createFileRoute } from "@tanstack/react-router";

const noStore = { "Cache-Control": "no-store" };

export const Route = createFileRoute("/api/profile/me")({
  server: { handlers: {
    GET: async ({ request }) => {
      const { toResponse } = await import("@/controllers/profile.controller");
      try {
        const { authenticateRequest } = await import("@/middlewares/auth.server");
        const { getProfile } = await import("@/services/profile.server");
        const { client, userId } = await authenticateRequest(request);
        return Response.json(await getProfile(client, userId), { headers: noStore });
      } catch (error) { return toResponse(error); }
    },
    PUT: async ({ request }) => {
      const { readJson, toResponse } = await import("@/controllers/profile.controller");
      try {
        const { authenticateRequest } = await import("@/middlewares/auth.server");
        const { updateProfile } = await import("@/services/profile.server");
        const { client, userId } = await authenticateRequest(request);
        return Response.json(await updateProfile(client, userId, await readJson(request, 4000)), { headers: noStore });
      } catch (error) { return toResponse(error); }
    },
  } },
});
