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
