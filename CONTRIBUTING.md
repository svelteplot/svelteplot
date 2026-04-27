# Contributing to SveltePlot

Thanks for contributing! This guide covers project layout, how to add new marks, and what we expect in pull requests. For setup and the core commands (`pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm test:visual`, `pnpm vr:report`), see the [README](./README.md).

## Project layout

SveltePlot is a monorepo. Library code lives under `packages/svelteplot/`; the showcase site (live examples, API docs, visual regression baselines) sits at the repo root.

- `packages/svelteplot/src/marks/` — mark components
- `packages/svelteplot/src/transforms/` — pure data transforms
- `packages/svelteplot/src/helpers/` — shared utilities (scales, resolve, reduce, etc.)
- `packages/svelteplot/src/types/` — TypeScript type definitions
- `packages/svelteplot/tests/` — unit tests
- `src/routes/marks/<name>/` — per-mark docs page
- `src/routes/examples/<name>/` — per-mark live examples
- `src/snapshots/<name>/` — VR baselines (light + dark)

The showcase imports the library via the `svelteplot` workspace package, so changes under `packages/svelteplot/` are picked up immediately by `pnpm dev`.

## Adding a new mark

A mark is a visual encoding component (like `Dot`, `Line`, `Hexbin`). Adding one touches several layers — types, exports, docs, examples, and tests. The list below is the minimum surface to cover.

### Source and types

- [ ] Component at `packages/svelteplot/src/marks/NewMark.svelte`
- [ ] Props interface with TypeScript generics: `<Datum extends DataRecord>`
- [ ] JSDoc `<!-- @component -->` block describing the mark
- [ ] Add to `MarkType` in `packages/svelteplot/src/types/mark.ts`
- [ ] Add a `PlotDefaults` entry in `packages/svelteplot/src/types/plot.ts`
- [ ] Read defaults via `getPlotDefaults().<markName>` in the component

### Exports

- [ ] Barrel export in `packages/svelteplot/src/marks/index.ts`. Top-level re-export and package exports are picked up automatically via the `marks/*.svelte` wildcard in `packages/svelteplot/package.json`.

### Documentation

- [ ] Docs page at `src/routes/marks/<name>/+page.md`
- [ ] Page data loader at `src/routes/marks/<name>/+page.ts`
- [ ] Live code blocks (` ```svelte live `) inside the page
- [ ] Sidebar entry in `config/sidebar.ts`
- [ ] Regenerate the API reference: `pnpm docs:api:marks`
- [ ] Update the jump-to anchor links at the top of `src/routes/api/marks/+page.md`

### Tests

- [ ] Unit test fixture at `packages/svelteplot/tests/<mark>.test.svelte`
- [ ] Unit test driver at `packages/svelteplot/tests/<mark>.test.svelte.ts`
- [ ] Cover: rendering, default and custom styling, channel mapping, CSS class application, empty data, single point, invalid coordinates, accessor functions
- [ ] Cover mark-specific behavior (faceting, grouping, alignment for paired marks)

For marks designed to pair with another (e.g., `Hexbin` + `Hexgrid`), add a sub-pixel center-alignment test that parses the rendered SVG `<path>` `d` attributes from both marks. Visual screenshots can hide small offsets that DOM extraction catches immediately.

### Examples and visual regression

- [ ] One or more example files at `src/routes/examples/<name>/*.svelte`
- [ ] Each example has frontmatter with `title`, `description`, and `sortKey`
- [ ] Generate VR baselines: `pnpm test:visual`. Light and dark mode snapshots are auto-generated as `.png` and `.dark.png`.

Examples are auto-discovered via `import.meta.glob` — no manual registration needed.

### Optional / mark-specific

- [ ] Canvas rendering variant under `packages/svelteplot/src/marks/helpers/` (e.g. `DotCanvas.svelte`)
- [ ] Event handler support via `addEventHandlers` from `packages/svelteplot/src/marks/helpers/events.js`
- [ ] Accessibility attributes (`role="button"`, ARIA labels) for interactive marks

## Adding a new transform

Transforms are pure functions that operate on `{data, ...channels}`. They live in `packages/svelteplot/src/transforms/` and are exported via that directory's `index.ts`. Add tests alongside the source file and a docs page at `src/routes/transforms/<name>/+page.md`.

## Submitting a pull request

Before opening a PR:

- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm check` passes (no `svelte-check` errors)
- [ ] If you changed visual output, regenerate the VR baselines and include the snapshot diffs in your branch

Keep PRs scoped — a new mark is one PR; a tooling change is another. If a PR grows beyond its original scope during review, split it.

## Help

- Issues and feature requests: <https://github.com/svelteplot/svelteplot/issues>
- Project homepage and live docs: <https://svelteplot.dev>
