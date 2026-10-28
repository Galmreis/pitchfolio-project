import { createRequestCloudClient } from "@/config/cloud.server";

export async function authenticateRequest(request: Request) {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || token.split(".").length !== 3) throw new Error("UNAUTHORIZED");
  const client = createRequestCloudClient(token);
  // The Auth server verifies signatures/expiry; decoding a JWT is not authentication.
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error("UNAUTHORIZED");
  return { client, userId: data.user.id };
}