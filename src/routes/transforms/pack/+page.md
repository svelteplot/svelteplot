---
title: Pack transform
---

The pack transform computes a [circle-packing](https://d3js.org/d3-hierarchy/pack) layout from hierarchical data, producing nested circles sized by a value field. Use **packNode** with [Dot](/marks/dot) marks and the `r` channel.

```svelte live
<script>
    import { Plot, Dot } from 'svelteplot';
    import { packNode } from 'svelteplot/transforms';

    import { page } from '$app/state';
    let { flare } = $derived(page.data.data);

    const opts = {
        path: 'id',
        delimiter: '.',
        value: 'value',
        size: [400, 400],
        padding: 2
    };
    const nodes = packNode(opts)({ data: flare });
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    height={400}
    aspectRatio={1}
    inset={2}>
    <Dot
        {...nodes}
        fill="depth"
        fillOpacity={0.6}
        stroke="depth" />
</Plot>
```

```svelte
<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    height={400}
    aspectRatio={1}
    inset={2}>
    <Dot
        {...nodes}
        fill="depth"
        fillOpacity={0.6}
        stroke="depth" />
</Plot>
```

## packNode(_options_)

Returns a transform factory function. Call the returned function with `{ data }` to get positioned output:

- `packNode(opts)({ data })` returns `{ data: PackNodeRecord[], x: 'x', y: 'y', r: 'r' }` — each node has `x`, `y`, `r`, `depth`, `height`, and `value`

## Stratification

Data can be structured in two ways:

**Path-based** — each row has a delimited path string:

```ts
const opts = {
    path: 'name',
    delimiter: '/',
    value: 'size'
};
```

**id/parentId** — each row has explicit parent references:

```ts
const opts = {
    id: 'id',
    parentId: 'parentId',
    value: 'size'
};
```

## Options

| Option        | Default      | Description                       |
| ------------- | ------------ | --------------------------------- |
| **path**      | —            | Path accessor for stratify        |
| **delimiter** | `"/"`        | Path delimiter                    |
| **id**        | `"id"`       | Id accessor (alternative to path) |
| **parentId**  | `"parentId"` | Parent-id accessor                |
| **value**     | `"value"`    | Value accessor for sizing circles |
| **size**      | `[1, 1]`     | Layout size [width, height]       |
| **padding**   | `0`          | Padding between circles           |
