# Adding Canvas Rendering to a Mark

This guide explains how to add a `canvas` rendering option to a svelteplot mark. Canvas rendering draws data points as pixels instead of SVG DOM elements, which is significantly faster for marks with 1000+ elements.

## Architecture overview

```
Raw data → Transforms → Scale projection → ScaledDataRecord[]
                                                    │
                                              Mark component
                                               ┌────┴────┐
                                             SVG       Canvas
                                           (DOM)      (pixels)
```

The fork happens at the very last step. Everything upstream (data, transforms, channel resolution, scale projection) is shared. A canvas helper receives `ScaledDataRecord[]` — data already in pixel coordinates — and draws it.

Canvas marks live inside the SVG via `<foreignObject>`:

```
<svg>
  <foreignObject>
    <canvas />          ← pixel rendering (fast)
  </foreignObject>
  <circle /><text />    ← SVG marks (interactive)
</svg>
```

This lets canvas and SVG marks coexist in the same plot.

## Convention

All canvas helpers follow the same structure. Use `ArrowCanvas.svelte` as the reference implementation.

### File structure

```svelte
<!--
@component
Helper component for rendering [MarkName] marks in canvas
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface [MarkName]CanvasProps {
        data: ScaledDataRecord<Datum>[];
        options: BaseMarkProps<Datum> & {
            // mark-specific props (e.g. headAngle, bend, anchor)
        };
        usedScales: UsedScales;
    }

    // Standard imports
    import type {
        BaseMarkProps,
        DataRecord,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import { resolveProp, resolveScaledStyleProps } from '../../helpers/resolve.js';
    import type { Attachment } from 'svelte/attachments';
    import { devicePixelRatio } from 'svelte/reactivity/window';
    import CanvasLayer from './CanvasLayer.svelte';
    import { resolveColor } from './canvas.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const plot = usePlot();

    let { data, options, usedScales }: [MarkName]CanvasProps = $props();

    const render: Attachment = (canvasEl: Element) => {
        const canvas = canvasEl as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        $effect(() => {
            if (context) {
                // 1. Setup
                context.resetTransform();
                context.scale(devicePixelRatio.current ?? 1, devicePixelRatio.current ?? 1);

                for (const d of data) {
                    if (!d.valid) continue;

                    // 2. Resolve styles
                    const styleProps = resolveScaledStyleProps(
                        d.datum,
                        options,
                        usedScales,
                        plot,
                        'stroke' // or 'fill' — see "Default color prop" below
                    ) as Record<string, unknown>;

                    const opacity = +(styleProps['opacity'] ?? 1);
                    const strokeOpacity = +(styleProps['stroke-opacity'] ?? 1);
                    const stroke = resolveColor(
                        String(styleProps.stroke || 'currentColor'),
                        canvas
                    );

                    if (!stroke || stroke === 'none') continue;

                    // 3. Resolve mark-specific props
                    const strokeWidth = (resolveProp(options.strokeWidth, d.datum, 1) ?? 1) as number;

                    // 4. Draw
                    context.lineWidth = strokeWidth;
                    context.strokeStyle = stroke;
                    context.globalAlpha = opacity * strokeOpacity;
                    context.beginPath();
                    // ... mark-specific draw calls ...
                    context.stroke();
                }
            }

            // 5. Cleanup
            return () => {
                context?.clearRect(
                    0,
                    0,
                    plot.width * (devicePixelRatio.current ?? 1),
                    plot.height * (devicePixelRatio.current ?? 1)
                );
            };
        });
    };
</script>

<CanvasLayer {@attach render} />
```

### Key conventions

**Props interface:** Use a named `interface` with generics (`Datum extends DataRecord`). Pass `options` directly, not a `mark` object — the canvas helper should receive only what it needs.

**Style resolution:** Use `resolveScaledStyleProps()` to get computed styles, then `resolveColor()` to handle `currentColor`, CSS variables, and SVG gradients. Canvas doesn't inherit CSS, so every color must be explicitly resolved.

**Default color prop:** The last argument to `resolveScaledStyleProps` determines the default color channel:

- `'stroke'` for line-like marks (Arrow, Link, Rule, Line, Tick)
- `'fill'` for area-like marks (Dot, Rect, Area, Geo)
- Some marks use both (Vector) — resolve fill and stroke separately

**Device pixel ratio:** Always `resetTransform()` then `scale(dpr, dpr)`. Cleanup must also multiply dimensions by dpr.

**Attachment pattern:** Use `const render: Attachment = (canvasEl: Element) => {` (not the `((canvas) => { ... }) as Attachment` cast pattern).

## Wiring into the mark component

1. Add `canvas?: boolean` to the mark's props interface
2. Import the canvas helper
3. Add `{#if canvas}` / `{:else}` in the mark's children snippet:

```svelte
{#snippet children({ scaledData, usedScales })}
    {#if canvas}
        <MyMarkCanvas
            data={scaledData}
            options={args}
            {usedScales} />
    {:else}
        <!-- existing SVG rendering -->
    {/if}
{/snippet}
```

## Common patterns

### Path2D for marks with existing path helpers

If the mark already has a helper that returns SVG path strings (like `arrowPath()`), use `Path2D`:

```js
const pathStr = arrowPath(x1, y1, x2, y2, ...);
const path = new Path2D(pathStr);
context.stroke(path);
```

### d3-shape with canvas context

For marks using d3-shape generators (line, area), set the canvas context:

```js
const fn = line().curve(curveFactory).context(context);
context.beginPath();
fn([
    [x1, y1],
    [x2, y2]
]);
context.stroke();
fn.context(null); // reset after loop
```

### Transforms (translate/rotate)

For marks that position shapes via transforms (Vector):

```js
context.save();
context.translate(d.x, d.y);
context.rotate(angleInRadians);
// draw in local space
context.restore();
```

### Shared geometry helpers

If the SVG mark and canvas helper need the same geometry logic, extract it to a shared file in `src/lib/helpers/` (see `vectorShapes.ts`). Don't duplicate shape definitions across files.

## What canvas can't do

These SVG-only features should be skipped in canvas mode:

- Per-element event handlers (`onclick`, `onmouseenter`)
- SVG `<marker>` elements (arrowheads on Link marks)
- `<textPath>` (text along a curve)
- CSS `:hover` states and transitions
- Svelte `transition:` and `animate:` directives
- Spherical/geo projections (use SVG for these)

Interactive features like tooltips still work via the `<Pointer>` component, which searches the data array independently of the rendering mode.

## Existing canvas helpers

| Helper       | Mark(s)                              | Technique                          | Default color |
| ------------ | ------------------------------------ | ---------------------------------- | ------------- |
| DotCanvas    | Dot                                  | d3-symbol via `context`            | fill          |
| LineCanvas   | Line, LineX, LineY                   | d3-line with `.context()`          | stroke        |
| AreaCanvas   | Area, AreaX, AreaY                   | d3-area with `.context()`          | fill          |
| RectCanvas   | Rect, BarX, BarY, Cell, RectX, RectY | `fillRect` / `strokeRect`          | fill          |
| RuleCanvas   | RuleX, RuleY                         | `moveTo` / `lineTo`                | stroke        |
| TickCanvas   | TickX, TickY                         | `moveTo` / `lineTo`                | stroke        |
| TextCanvas   | Text                                 | `fillText` / `strokeText`          | fill          |
| TrailCanvas  | Trail                                | width-varying path                 | fill          |
| GeoCanvas    | Geo                                  | d3-geoPath with `.context()`       | fill          |
| ArrowCanvas  | Arrow                                | `Path2D(arrowPath())`              | stroke        |
| LinkCanvas   | Link                                 | d3-line with `.context()`          | stroke        |
| VectorCanvas | Vector                               | `Path2D(shapePath())` + transforms | varies        |
