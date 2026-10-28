# Backend foundation
- [x] Add compatible profile, portfolio and five-slide deck schema with owner/public access rules.
- [x] Add storage buckets and owner-scoped policies (private while public buckets are blocked).
- [x] Connect validated transactional draft publication to the editor.
- [x] Add typed parsed-text ingestion service, fact-safe fallback and custom durable usage limits.
- [x] Verify validation and public app flows: 10 tests passed; guided generation and login prompt checked; unauthenticated API returns 401; schema and policies confirmed.
- [ ] Verify authenticated publication end-to-end — blocked: no signed-up user exists to mint a session.
- [ ] Enable public photos/PDFs — blocked: workspace disallows public buckets.