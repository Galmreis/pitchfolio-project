import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/signup")({
  server: { handlers: {
    POST: async ({ request }) => {
      const { readJson, toResponse } = await import("@/controllers/profile.controller");
      try {
        const { signup } = await import("@/controllers/auth.controller");
        const result = await signup(await readJson(request, 4000), new URL(request.url).origin);
        return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
      } catch (error) { return toResponse(error); }
    },
  } },
});
