import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateUpload, uploadSchema } from "@/validators/uploads";

export const uploadOwnerFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const file = validateUpload(data);
    const path = `${context.userId}/${crypto.randomUUID()}-${file.filename}`;
    // Storage RLS consumes the durable upload budget, including direct-client writes.
    const { error } = await context.supabase.storage.from(file.bucket).upload(path, file.bytes, { contentType: file.contentType, upsert: false });
    if (error) throw new Error("Upload indisponível ou limite horário atingido.");
    return { bucket: file.bucket, path };
  });