---
title: Tree transform
---

The tree transforms compute [tree](https://d3js.org/d3-hierarchy/tree) or [cluster](https://d3js.org/d3-hierarchy/cluster) layout positions from hierarchical data. Following Observable Plot's convention, two transforms are provided: **treeNode** for node positions and **treeLink** for link endpoints.

```svelte live
<script>
    import { Plot, Dot, Link, Text } from 'svelteplot';
    import {
        treeNode,
        treeLink
    } from 'svelteplot/transforms';

    import { page } from '$app/state';
    let { flare } = $derived(page.data.data);

    const opts = { path: 'id', delimiter: '.' };
    const nodeData = treeNode(opts)({ data: flare }).data;
    const linkData = treeLink(opts)({ data: flare }).data;
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    height={400}
    marginRight={120}
    inset={10}>
    <Link
        data={linkData}
        x1="x1"
        y1="y1"
        x2="x2"
        y2="y2"
        curve="bump-x"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
    <Text
        data={nodeData}
        x="x"
        y="y"
        text={(d) =>
            d.height === 0 ? d.id.split('.').pop() : null}
        dx={6}
        fontSize={9} />
</Plot>
```

```svelte
<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    height={400}
    marginRight={120}
    inset={10}>
    <Link
        data={linkData}
        x1="x1"
        y1="y1"
        x2="x2"
        y2="y2"
        curve="bump-x"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
    <Text
        data={nodeData}
        x="x"
        y="y"
        text={(d) =>
            d.height === 0 ? d.id.split('.').pop() : null}
        dx={6}
        fontSize={9} />
</Plot>
```

## treeNode(_options_) / treeLink(_options_)

Both return transform factory functions. Call the returned function with `{ data }` to get positioned output:

- `treeNode(opts)({ data })` returns `{ data: TreeNodeRecord[], x: 'x', y: 'y' }` — each node has `x`, `y`, `depth`, and `height`
- `treeLink(opts)({ data })` returns `{ data: TreeLinkRecord[], x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2' }` — each link has `source` and `target` references

When both are called on the same data array, the layout runs only once (cached by array reference).

## Stratification

Data can be structured in two ways:

**Path-based** — each row has a delimited path string:

```ts
const opts = { path: 'name', delimiter: '/' };
// data: [{ name: 'root/a/a1' }, { name: 'root/a/a2' }, ...]
```

**id/parentId** — each row has explicit parent references:

```ts
const opts = { id: 'id', parentId: 'parentId' };
// data: [{ id: 'root', parentId: null }, { id: 'a', parentId: 'root' }, ...]
```

## Options

| Option         | Default      | Description                       |
| -------------- | ------------ | --------------------------------- |
| **path**       | —            | Path accessor for stratify        |
| **delimiter**  | `"/"`        | Path delimiter                    |
| **id**         | `"id"`       | Id accessor (alternative to path) |
| **parentId**   | `"parentId"` | Parent-id accessor                |
| **layout**     | `"tree"`     | `"tree"` or `"cluster"`           |
| **size**       | `[1, 1]`     | Layout size [width, height]       |
| **separation** | —            | Node separation function          |
| **horizontal** | `false`      | Swap x/y for horizontal layout    |

## Cluster layout

Set `layout: 'cluster'` to align all leaf nodes at the same depth.

```svelte live
<script>
    import { Plot, Dot, Link } from 'svelteplot';
    import {
        treeNode,
        treeLink
    } from 'svelteplot/transforms';

    import { page } from '$app/state';
    let { flare } = $derived(page.data.data);

    const opts = {
        path: 'id',
        delimiter: '.',
        layout: 'cluster'
    };
    const nodeData = treeNode(opts)({ data: flare }).data;
    const linkData = treeLink(opts)({ data: flare }).data;
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    height={400}
    marginRight={120}
    inset={10}>
    <Link
        data={linkData}
        x1="x1"
        y1="y1"
        x2="x2"
        y2="y2"
        curve="bump-x"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
</Plot>
```

```svelte
<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    height={400}
    marginRight={120}
    inset={10}>
    <Link
        data={linkData}
        x1="x1"
        y1="y1"
        x2="x2"
        y2="y2"
        curve="bump-x"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
</Plot>
```

## Horizontal layout

Set `horizontal: true` to swap x and y, rendering nodes left-to-right. Use `curve="bump-y"` for the links.

```svelte live
<script>
    import { Plot, Dot, Link } from 'svelteplot';
    import {
        treeNode,
        treeLink
    } from 'svelteplot/transforms';

    import { page } from '$app/state';
    let { flare } = $derived(page.data.data);

    const opts = {
        path: 'id',
        delimiter: '.',
        horizontal: true
    };
    const nodeData = treeNode(opts)({ data: flare }).data;
    const linkData = treeLink(opts)({ data: flare }).data;
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    height={400}
    marginLeft={10}
    marginRight={140}
    inset={10}>
    <Link
        data={linkData}
        x1="x1"
        y1="y1"
        x2="x2"
        y2="y2"
        curve="bump-y"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
</Plot>
```

```svelte
<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    height={400}
    marginLeft={10}
    marginRight={140}
    inset={10}>
    <Link
        data={linkData}
        x1="x1"
        y1="y1"
        x2="x2"
        y2="y2"
        curve="bump-y"
        stroke="currentColor"
        strokeOpacity={0.5} />
    <Dot data={nodeData} x="x" y="y" fill="depth" r={3} />
</Plot>
```
