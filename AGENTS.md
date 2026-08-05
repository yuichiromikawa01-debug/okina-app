<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Dev server rules

- Do NOT start or restart `pnpm dev` unless the user explicitly asks.
- Do NOT run `pnpm build` while the dev server may be running — use `pnpm lint` for quick checks.
- Never delete `.next` while dev is running.
- The user should run `pnpm dev` in their own terminal for a persistent server.
- If Turbopack instability is suspected, the user can run `pnpm dev:stable` (webpack fallback).
