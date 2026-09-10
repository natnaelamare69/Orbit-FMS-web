# Domain docs

This repo uses a **single-context** layout.

## Layout

- A single `CONTEXT.md` at the repo root describes the whole project.
- Architecture Decision Records (ADRs) live in `docs/adr/`.

## Consumer rules

- Read `CONTEXT.md` at the repo root before making design decisions that touch
  the project's domain or architecture.
- New ADRs go in `docs/adr/` following the existing ADR format.
- If the project grows into multiple loosely-coupled packages, consider moving
  to a multi-context layout (a root `CONTEXT-MAP.md` pointing to per-context
  `CONTEXT.md` files) — but single-context is the right default today.