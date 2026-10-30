/**
 * Utility functions for generating reliable social sharing URLs across
 * WhatsApp, LinkedIn, and native device share sheets, with fallbacks
 * for local development, Lovable preview iframes, and scraper-blocked domains.
 */
export function buildShareUrls(rawUrl: string, name?: string) {
  let absoluteUrl = rawUrl;
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://pitchfolio.app";
    const parsed = new URL(rawUrl, origin);
    absoluteUrl = parsed.href;
  } catch {
    absoluteUrl = rawUrl.startsWith("http")
      ? rawUrl
      : `https://pitchfolio.app${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
  }

  // Detect whether this is a local development or Lovable preview environment.
  // External scrapers (such as LinkedInBot) cannot crawl localhost or Cloudflare-protected Lovable preview URLs.
  const isPreview = /localhost|127\.0\.0\.1|lovableproject\.com|lovable\.app|lovable\.dev/i.test(absoluteUrl);

  let publicUrlForScraper = absoluteUrl;
  if (isPreview) {
    try {
      const parsed = new URL(absoluteUrl);
      publicUrlForScraper = `https://pitchfolio.app${parsed.pathname}${parsed.search}`;
    } catch {
      publicUrlForScraper = "https://pitchfolio.app";
    }
  }

  const shareText = `Confira meu portfólio e pitch deck profissional${name ? ` (${name})` : ""}: ${absoluteUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrlForScraper)}`;

  return {
    absoluteUrl,
    publicUrlForScraper,
    isPreview,
    isLocal: isPreview,
    shareText,
    whatsappUrl,
    whatsappWebUrl,
    linkedinUrl,
  };
}
