# Issue tracker

This repo uses a **local markdown** issue tracker.

## How issues are stored

- Issues live as markdown files under `.scratch/<feature>/` in this repo.
- Each feature gets its own subfolder; each issue is a single markdown file.
- Skills that read/write issues (`to-tickets`, `triage`, `to-spec`) work with these
  files directly — no GitHub (`gh`) or GitLab (`glab`) CLI is involved.

## Creating an issue

Create one markdown file per issue under `.scratch/<feature>/`, e.g.
`.scratch/login/password-reset.md`.

## Note on the future

This local-markdown tracker is temporary. Work is expected to migrate to
**Linear** tickets later. To keep that migration straightforward, always keep a
feature's issues isolated under its own `.scratch/<feature>/` subfolder.

When you're ready to switch, edit this file (or re-run the setup skill) and
record the Linear workflow here so the issue-writing skills target Linear
instead.