# Svelte MCP server guidelines

Use the Svelte MCP server for Svelte 5 and SvelteKit documentation and automation.

## Workflow

- When asked about Svelte or SvelteKit, call `list-sections` first to discover relevant docs (returns titles, use_cases, and paths).
- Review the `use_cases`, then call `get-documentation` for every relevant section you identified.
- Run `svelte-autofixer` on any Svelte code you write and repeat until it reports no issues or suggestions.
- Offer `playground-link` only after the user confirms they want a playground URL and only when the code was not written to project files.

## Tool quick reference

1. `list-sections`: initial discovery of documentation.
2. `get-documentation`: fetch full content for chosen sections (single or multiple).
3. `svelte-autofixer`: analyze Svelte code and return fixes/suggestions.
4. `playground-link`: generate a Svelte Playground link after user opt-in.

## SveltePlot project notes

- Package manager: prefer `pnpm` (lockfile present). Install deps with `pnpm install`.
- Dev/build: `pnpm dev`, `pnpm build`, `pnpm preview`.
- Static checks: `pnpm check` (svelte-check) and `pnpm lint`; format with `pnpm format`.
- Unit tests: `pnpm test` (Vitest, jsdom).
- Visual regression: `pnpm test:visual` (starts dev server, uses Puppeteer). Baselines live in `src/snapshots/`; latest/diff/report output to `static/__vr/`. Optional: set `VR_DIFF_THRESHOLD` to adjust tolerance and run `pnpm vr:report` to generate `static/__vr/report.html`.
