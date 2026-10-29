/**
 * Utility functions for generating reliable social sharing URLs across
 * WhatsApp and LinkedIn without breaking on local development or non-public domains.
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

  // LinkedIn requires a publicly reachable domain (it throws a server error when scraping localhost or 127.0.0.1).
  let publicUrlForScraper = absoluteUrl;
  const isLocal = /localhost|127\.0\.0\.1/i.test(absoluteUrl);
  if (isLocal) {
    try {
      const parsed = new URL(absoluteUrl);
      publicUrlForScraper = `https://pitchfolio.app${parsed.pathname}${parsed.search}`;
    } catch {
      publicUrlForScraper = "https://pitchfolio.app";
    }
  }

  const shareText = `Confira meu portfólio e pitch deck profissional${name ? ` (${name})` : ""}: ${absoluteUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrlForScraper)}`;

  return {
    absoluteUrl,
    publicUrlForScraper,
    isLocal,
    shareText,
    whatsappUrl,
    linkedinUrl,
  };
}
