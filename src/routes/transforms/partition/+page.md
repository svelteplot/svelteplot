---
title: Partition transform
---

The partition transform computes a [partition](https://d3js.org/d3-hierarchy/partition) layout from hierarchical data, producing rectangular regions where each level of the hierarchy occupies a row (or column). Use **partitionNode** with [Rect](/marks/rect) marks for icicle diagrams, or combine with **partitionLink** and [Link](/marks/link) marks.

```svelte live
<script>
    import { Plot, Rect } from 'svelteplot';
    import { partitionNode } from 'svelteplot/transforms';

    import { page } from '$app/state';
    let { flare } = $derived(page.data.data);

    const opts = { path: 'id', delimiter: '.', value: 'value', size: [1, 1] };
    const nodes = partitionNode(opts)({ data: flare });
</script>

<Plot x={{ axis: false }} y={{ axis: false }} height={400} inset={2}>
    <Rect {...nodes} fill="depth" strokeWidth={0.5} stroke="white" />
</Plot>
```

```svelte
<Plot x={{ axis: false }} y={{ axis: false }} height={400} inset={2}>
    <Rect {...nodes} fill="depth" strokeWidth={0.5} stroke="white" />
</Plot>
```

## partitionNode(*options*) / partitionLink(*options*)

Both return transform factory functions. Call the returned function with `{ data }` to get positioned output:

- `partitionNode(opts)({ data })` returns `{ data: PartitionNodeRecord[], x1: 'x0', y1: 'y0', x2: 'x1', y2: 'y1' }` — each node has `x0`, `y0`, `x1`, `y1`, `depth`, `height`, and `value`
- `partitionLink(opts)({ data })` returns `{ data: PartitionLinkRecord[], x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2' }` — each link has `source` and `target` references

When both are called on the same data array, the layout runs only once (cached by array reference).

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
| **value** | `"value"` | Value accessor for sizing partitions |
| **size** | `[1, 1]` | Layout size [width, height] |
| **padding** | `0` | Padding between nodes |
| **round** | `false` | Round coordinates to integers |
| **horizontal** | `false` | Swap x/y for horizontal layout |

## Horizontal layout

Set `horizontal: true` for an icicle diagram that flows left-to-right.

```svelte live
<script>
    import { Plot, Rect } from 'svelteplot';
    import { partitionNode } from 'svelteplot/transforms';

    import { page } from '$app/state';
    let { flare } = $derived(page.data.data);

    const opts = { path: 'id', delimiter: '.', value: 'value', size: [1, 1], horizontal: true };
    const nodes = partitionNode(opts)({ data: flare });
</script>

<Plot x={{ axis: false }} y={{ axis: false }} height={400} inset={2}>
    <Rect {...nodes} fill="depth" strokeWidth={0.5} stroke="white" />
</Plot>
```

```svelte
<Plot x={{ axis: false }} y={{ axis: false }} height={400} inset={2}>
    <Rect {...nodes} fill="depth" strokeWidth={0.5} stroke="white" />
</Plot>
```
