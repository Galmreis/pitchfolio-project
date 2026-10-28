# PitchFolio backend foundation

## Layout
```text
src/config/              limits and per-request Cloud client
src/validators/          shared Zod payload and file validation
src/types/               portfolio, draft, input and five-slide DTOs
src/middlewares/         raw HTTP bearer verification
src/services/            transactional publication and evidence-safe ingestion
src/controllers/         typed app server functions
src/routes/api/portfolios/publish-draft.ts   authenticated HTTP contract
```

## Publication
The editor uses `publishPortfolioDraft`. External JSON callers can use
`POST /api/portfolios/publish-draft` with a verified bearer token. The service
validates `{ portfolio, theme, slug?, inputMethod?, photoUrl? }` and executes
`publish_pitchfolio_draft` as the signed-in user, under RLS. One PostgreSQL
transaction creates or updates both records. Updating someone else's slug fails.
The response contains `id`, `slug`, `path`, `url`, and `qrPayload`.
Existing `/p/$slug` links are preserved rather than replaced with root-level URLs.

## Data and access
Profiles are created by the signup trigger and their email is owner-only.
Portfolios reference profiles. `data` is the canonical view dataset; typed theme,
name, about and experience fields mirror it. Deck validation enforces all five
required slide objects against that dataset. Owners can read unpublished rows via
`listOwnedPortfolios`; public readers only see published records.
All public tables have explicit grants and RLS; budget rows are inaccessible to
ordinary clients. Existing portfolios are backfilled without dropping data.

## Ingestion
`structurePortfolio` retains the current streamed Lovable AI call for guided
answers. Incoming payloads and AI output are validated. A conservative evidence
gate rejects rewrites with unfamiliar factual vocabulary; fallback retains supplied
facts without invented leadership, metrics, employers or education. This is not a
semantic truth guarantee: user review remains necessary before publishing.
`ingestCareerInput` accepts parsed PDF/LinkedIn text or guided answers and returns
the unified portfolio plus derived deck through the deterministic fallback.
Binary PDF extraction, voice transcription and their onboarding controls are not
implemented by this backend foundation.

## Storage and limits
`resumes` (5 MB), `avatars` (2 MB), and `published_pdfs` (10 MB) exist as private
buckets because the workspace blocks public buckets. Owner-prefixed storage
policies restrict reads/writes/deletes. `uploadOwnerFile` validates size, filename,
MIME type and signatures. File signature checks are not malware scanning.
The SQL budget is atomic: 60 AI calls/hour shared by anonymous visitors, and 20
uploads/hour per signed-in owner. The AI controller currently uses the shared
anonymous budget even when a visitor has signed in. No IP-based identity is
trusted. Storage RLS also applies the budget to direct client uploads.
The anonymous budget can be exhausted by other visitors; it is an explicit MVP
tradeoff, not distributed abuse prevention. Hourly rows are durable and require
future retention/cleanup maintenance.

## Remaining integration work
- Public-read photos/PDFs: workspace owner must allow public buckets in
  Settings → Privacy & Security; keep them private until then.
- Photo display and deck PDF generation/download are not wired to the UI.
- Email confirmation remains on. Sign-in publication needs a confirmed test
  account or an approved managed test session.
- The API returns QR payload; a QR image is not yet rendered in the share dialog.
- No change to auth providers beyond the existing email/password flow.