import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/readyz")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { createRequestCloudClient } = await import("@/config/cloud.server");
          const client = createRequestCloudClient();
          // Quick lightweight read to ensure database and auth service are reachable
          const { error } = await client.from("portfolios").select("id").limit(1);

          if (error) {
            return Response.json(
              {
                status: "degraded",
                database: "unavailable",
                timestamp: new Date().toISOString(),
              },
              { status: 503, headers: { "Cache-Control": "no-store" } },
            );
          }

          return Response.json(
            {
              status: "ready",
              database: "connected",
              timestamp: new Date().toISOString(),
            },
            { status: 200, headers: { "Cache-Control": "no-store" } },
          );
        } catch {
          return Response.json(
            {
              status: "unhealthy",
              database: "error",
              timestamp: new Date().toISOString(),
            },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
