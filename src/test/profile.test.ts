import { describe, expect, it } from "vitest";
import { githubUrlSchema, integrationsSchema, linkedinUrlSchema, phoneSchema, signupSchema, strongPasswordSchema } from "@/validators/profile";

describe("profile validators", () => {
  it("normalizes BR phone to E.164", () => {
    expect(phoneSchema.parse("(11) 98765-4321")).toBe("+5511987654321");
    expect(phoneSchema.parse("+55 11 98765-4321")).toBe("+5511987654321");
    expect(phoneSchema.safeParse("123").success).toBe(false);
  });
  it("rejects weak passwords", () => {
    expect(strongPasswordSchema.safeParse("abcdefgh").success).toBe(false);
    expect(strongPasswordSchema.safeParse("Abcdef1!").success).toBe(true);
  });
  it("requires all signup fields and strips HTML", () => {
    const r = signupSchema.parse({ email: "A@B.com", password: "Abcdef1!", first_name: " <b>Ana</b> ", last_name: "Lima", phone_number: "11987654321" });
    expect(r.first_name).toBe("bAna/b");
    expect(r.email).toBe("a@b.com");
    expect(signupSchema.safeParse({ email: "a@b.com", password: "Abcdef1!" }).success).toBe(false);
  });
  it("only accepts linkedin.com/in and github.com links", () => {
    expect(linkedinUrlSchema.parse("linkedin.com/in/ana-lima/")).toBe("https://linkedin.com/in/ana-lima");
    expect(linkedinUrlSchema.safeParse("https://linkedin.com/company/x").success).toBe(false);
    expect(githubUrlSchema.parse("http://github.com/ana")).toBe("https://github.com/ana");
    expect(githubUrlSchema.safeParse("https://evil.com/github.com/ana").success).toBe(false);
    expect(integrationsSchema.parse({ github_url: null }).github_url).toBeNull();
  });
});
