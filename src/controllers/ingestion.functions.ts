import { createServerFn } from "@tanstack/react-start";
import { ingestionSchema, createDeck } from "@/validators/portfolio";
import { processInput } from "@/services/aiProcessor.service";

// Parsed documents have the same DTO as guided answers. Binary extraction is a
// separate concern; callers cannot trick this function into fetching remote URLs.
export const ingestCareerInput = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ingestionSchema.parse(input))
  .handler(async ({ data }) => {
    const { portfolio } = processInput(data);
    return { portfolio, deck: createDeck(portfolio), ai: false };
  });