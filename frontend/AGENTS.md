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

## Project rules

- All data access goes through `src/lib/api.ts` (currently a localStorage mock) so the real backend can be swapped in without touching UI code.
- Uploads must follow requestUploadUrl -> uploadToUrl -> confirmUpload; file bytes never pass through the app's own API.
