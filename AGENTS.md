<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Portfolio drafts live in localStorage until published; published portfolios are rows in `portfolios` (jsonb `data`, unique `slug`) readable publicly via `/p/$slug`. Why: users can build before creating an account.
- AI structuring runs in a server function with a local fallback so generation never blocks the flow. Why: demo must always work.
- Client-safe Zod validators live in src/validators; request clients and helpers use .server.ts and controllers expose server functions. Why: validation is shared without bundling credentials.
- Publish portfolios and their derived five-slide decks through one authenticated PostgreSQL RPC transaction. Why: both views must stay consistent and enforce owner access.
- Use additive columns and preserve the existing /p/$slug sharing route. Why: published links and older clients remain compatible.
- Upload files only under owner UUID prefixes with storage RLS and a durable SQL usage budget. Why: direct storage writes must not bypass access and usage rules.
- Imported portfolio sections (projects, skills, certifications, timeline) keep every item with is_visible/display_order; public RLS exposes only visible items of published portfolios, and curation changes go through one RPC transaction. Why: users curate without losing data and hidden items never leak.
- Profile edits (name, phone, photo, links, email) sync to portfolios and deck slides 1/5 via the sync_profile_to_portfolio DB trigger; REST profile/signup endpoints live in src/routes/api/{auth,profile}. Why: one source of truth, no drift between profile and published pages.
