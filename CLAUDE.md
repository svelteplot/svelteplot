# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (http://localhost:5173)
pnpm build            # Build library to /dist
pnpm test             # Run all Vitest unit tests (jsdom)
pnpm test -- src/tests/dot.test.ts  # Run a single test file
pnpm check            # svelte-check type validation
pnpm lint             # Prettier + ESLint check
pnpm format           # Auto-format (prettier + eslint --fix)
pnpm lint:types       # TypeScript strict check (tsc --noEmit)
pnpm test:visual      # Visual regression tests via Puppeteer
pnpm vr:report        # View visual regression report at /__vr/report.html
```

## Architecture

SveltePlot is a **grammar-of-graphics** data visualization library for Svelte 5, inspired by Observable Plot. The core idea: a `<Plot>` is built by composing **marks** (visual encodings) with **transforms** (data operations) and **scales** (mappings from data domain to visual range).

### Plot rendering pipeline

```
Raw data → Channel accessors → Transforms → Scale computation → SVG/Canvas output
```

There are two Plot components:

- **`src/lib/Plot.svelte`** — User-facing wrapper; auto-adds axes, grids, and legends based on declared marks.
- **`src/lib/core/Plot.svelte`** — Low-level core; manages the SVG container, scale computation, mark registration, layout, and Svelte context.

Marks register themselves into the Plot context via `addMark()` during their component lifecycle. The core Plot collects all marks, computes scales across the full dataset, then renders each mark with resolved scale functions.

### Marks (`src/lib/marks/`)

Each mark is a Svelte component (e.g. `Dot.svelte`, `BarY.svelte`) that wraps `<Mark>` (the base component). A mark:

1. Declares its channels (`x`, `y`, `fill`, `r`, etc.) and which scale each maps to.
2. Runs data through transforms in a `$derived` block (e.g. `sort(recordizeXY({data, ...props}))`).
3. Renders SVG elements or delegates to a Canvas helper (`DotCanvas.svelte`, etc.).

Channel accessors (`ChannelAccessor<T>`) can be a constant, a field name string, or a `(d) => value` function. Pass `{value: 'field', scale: false}` to bypass scaling.

### Transforms (`src/lib/transforms/`)

Pure functions that transform the `{data, ...channels}` object. They are composed in marks:

```ts
const args = $derived(
    sort(recordizeXY({ data, x, y, fill, ...rest }))
);
```

Key transforms: `sort`, `filter`, `stack`, `bin`, `group`, `dodge`, `jitter`, `normalize`, `map`, `window`, `bollinger`, `density`.

### Types (`src/lib/types/`)

- `channel.ts` — `ChannelAccessor`, `ScaledChannelName`
- `mark.ts` — `BaseMarkProps`, `MarkType`
- `plot.ts` — `PlotOptions`, `PlotState`, `PlotContext`
- `scale.ts` — `ScaleOptions`, `ScaleName`, `ScaleType`
- `axes.ts` — Axis/grid option types

### Helpers (`src/lib/helpers/`)

- `scales.ts` — `computeScales()`, `normalizeScaleFn()`
- `resolve.ts` — Channel value resolution against data rows
- `autoTicks.ts` — Automatic tick generation
- `colors.ts`, `symbols.ts` — Visual encoding utilities

### Hooks (`src/lib/hooks/`)

- `usePlot.svelte.ts` — `usePlot()` returns read-only `PlotState` (width, height, scales, options); must be called within a `<Plot>` tree.
- `plotDefaults.ts` — `setPlotDefaults()` sets Svelte context defaults for all `<Plot>` descendants.

### Constants (`src/lib/constants.ts`)

`CHANNEL_SCALE` maps channel names to scale names (e.g. `fill → color`, `x → x`). `INDEX` is a Symbol key attached to each data record tracking its original array index.

### Tests

Unit tests live in `src/tests/` and alongside source files as `.test.ts` / `.test.svelte.ts`. Visual regression baselines are in `src/snapshots/`; output goes to `static/__vr/`.
