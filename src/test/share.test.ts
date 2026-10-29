import { describe, it, expect } from "vitest";
import { buildShareUrls } from "@/lib/share";

describe("buildShareUrls", () => {
  it("generates correct WhatsApp and LinkedIn links for standard public domain", () => {
    const raw = "https://pitchfolio.app/p/ana-souza-demo";
    const { absoluteUrl, whatsappUrl, linkedinUrl, isLocal } = buildShareUrls(raw, "Ana Souza");

    expect(isLocal).toBe(false);
    expect(absoluteUrl).toBe("https://pitchfolio.app/p/ana-souza-demo");
    expect(whatsappUrl).toContain("https://api.whatsapp.com/send?text=");
    expect(whatsappUrl).toContain(encodeURIComponent("Ana Souza"));
    expect(whatsappUrl).toContain(encodeURIComponent(raw));
    expect(linkedinUrl).toContain("https://www.linkedin.com/sharing/share-offsite/?url=");
    expect(linkedinUrl).toContain(encodeURIComponent("https://pitchfolio.app/p/ana-souza-demo"));
  });

  it("handles relative path safely by normalizing to absolute URL", () => {
    const raw = "/p/lucas-mendes";
    const { absoluteUrl, linkedinUrl } = buildShareUrls(raw, "Lucas");

    expect(absoluteUrl).toContain("/p/lucas-mendes");
    expect(linkedinUrl).toContain("https://www.linkedin.com/sharing/share-offsite/?url=");
  });

  it("handles localhost URLs by mapping scraper URL to public domain to prevent LinkedIn crawler errors", () => {
    const raw = "http://localhost:3000/p/ana-souza-demo";
    const { absoluteUrl, publicUrlForScraper, isLocal, linkedinUrl } = buildShareUrls(raw, "Ana Souza");

    expect(isLocal).toBe(true);
    expect(absoluteUrl).toBe("http://localhost:3000/p/ana-souza-demo");
    expect(publicUrlForScraper).toBe("https://pitchfolio.app/p/ana-souza-demo");
    expect(linkedinUrl).toContain(encodeURIComponent("https://pitchfolio.app/p/ana-souza-demo"));
  });

  it("handles Lovable preview domains (lovableproject.com/lovable.app) by mapping scraper to public domain", () => {
    const raw = "https://preview-1234.lovableproject.com/p/ana-souza-demo";
    const { absoluteUrl, publicUrlForScraper, isPreview, linkedinUrl, whatsappWebUrl } = buildShareUrls(raw, "Ana Souza");

    expect(isPreview).toBe(true);
    expect(absoluteUrl).toBe("https://preview-1234.lovableproject.com/p/ana-souza-demo");
    expect(publicUrlForScraper).toBe("https://pitchfolio.app/p/ana-souza-demo");
    expect(linkedinUrl).toContain(encodeURIComponent("https://pitchfolio.app/p/ana-souza-demo"));
    expect(whatsappWebUrl).toContain("https://web.whatsapp.com/send?text=");
  });

  it("generates valid universal WhatsApp link without wa.me redirect requirement", () => {
    const raw = "https://pitchfolio.app/p/teste";
    const { whatsappUrl } = buildShareUrls(raw);

    expect(whatsappUrl.startsWith("https://api.whatsapp.com/send?text=")).toBe(true);
  });
});
