import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/profile/me/avatar")({
  server: { handlers: {
    POST: async ({ request }) => {
      const { readJson, toResponse } = await import("@/controllers/profile.controller");
      try {
        const { authenticateRequest } = await import("@/middlewares/auth.server");
        const { uploadAvatar } = await import("@/services/profile.server");
        const { client, userId } = await authenticateRequest(request);
        // 5 MB image as base64 (~6.7 MB) plus JSON overhead.
        const body = await readJson(request, 7_100_000);
        return Response.json(await uploadAvatar(client, userId, body), { headers: { "Cache-Control": "no-store" } });
      } catch (error) { return toResponse(error); }
    },
  } },
});
