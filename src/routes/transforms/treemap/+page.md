---
title: Treemap transform
---

The treemap transform computes a [treemap](https://d3js.org/d3-hierarchy/treemap) layout from hierarchical data, producing space-filling rectangular regions sized by a value field. Use **treemapNode** with [Rect](/marks/rect) or Cell marks.

```svelte live
<script>
    import { Plot, Rect } from 'svelteplot';
    import { treemapNode } from 'svelteplot/transforms';

    import { page } from '$app/state';
    let { flare } = $derived(page.data.data);

    const opts = { path: 'id', delimiter: '.', value: 'value', size: [1, 1] };
    const nodes = treemapNode(opts)({ data: flare });
    const leaves = { ...nodes, data: nodes.data.filter((d) => d.height === 0) };
</script>

<Plot x={{ axis: false }} y={{ axis: false }} height={400} inset={2}>
    <Rect {...leaves} fill="depth" strokeWidth={1} stroke="white" />
</Plot>
```

```svelte
<Plot x={{ axis: false }} y={{ axis: false }} height={400} inset={2}>
    <Rect {...leaves} fill="depth" strokeWidth={1} stroke="white" />
</Plot>
```

## treemapNode(*options*)

Returns a transform factory function. Call the returned function with `{ data }` to get positioned output:

- `treemapNode(opts)({ data })` returns `{ data: TreemapNodeRecord[], x1: 'x0', y1: 'y0', x2: 'x1', y2: 'y1' }` — each node has `x0`, `y0`, `x1`, `y1`, `depth`, `height`, and `value`

## Stratification

Data can be structured in two ways:

**Path-based** — each row has a delimited path string:

```ts
const opts = { path: 'name', delimiter: '/', value: 'size' };
```

**id/parentId** — each row has explicit parent references:

```ts
const opts = { id: 'id', parentId: 'parentId', value: 'size' };
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| **path** | — | Path accessor for stratify |
| **delimiter** | `"/"` | Path delimiter |
| **id** | `"id"` | Id accessor (alternative to path) |
| **parentId** | `"parentId"` | Parent-id accessor |
| **value** | `"value"` | Value accessor for sizing rectangles |
| **size** | `[1, 1]` | Layout size [width, height] |
| **padding** | `0` | Inner padding between siblings |
| **paddingOuter** | `0` | Outer padding around the treemap |
| **paddingTop** | `0` | Padding between parent and children |
| **tile** | `"squarify"` | Tiling algorithm: `"squarify"`, `"binary"`, `"dice"`, `"slice"`, `"sliceDice"` |
| **ratio** | golden ratio | Target aspect ratio for squarify tiling |
| **round** | `false` | Round coordinates to integers |
