---
title: Force layout transform
---

The force layout transform runs a [d3-force](https://d3js.org/d3-force) simulation to compute positions for network diagrams. It takes arrays of nodes and links and returns positioned data for use with marks like [Arrow](/marks/arrow) and [Dot](/marks/dot).

```svelte live
<script>
    import { Plot, Arrow, Dot } from 'svelteplot';
    import { forceLayout } from 'svelteplot/transforms';

    import { page } from '$app/state';
    let { graph } = $derived(page.data.data);

    const { nodes, links } = $derived(
        forceLayout(graph.nodes, graph.links)
    );
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    color={{ type: 'categorical' }}
    height={400}
    inset={10}>
    <Arrow
        data={links}
        x1={(d) => d.source.x}
        y1={(d) => d.source.y}
        x2={(d) => d.target.x}
        y2={(d) => d.target.y}
        strokeOpacity={0.3} />
    <Dot data={nodes} x="x" y="y" fill="group" />
</Plot>
```

```svelte
<script>
    import { Plot, Arrow, Dot } from 'svelteplot';
    import {
        forceNode,
        forceLink
    } from 'svelteplot/transforms';

    // Factory pattern — options bound once, simulation cached
    // Both factories must share the same options reference for caching to work
    const opts = { charge: -50 };
    const node = forceNode(graph.links, opts);
    const link = forceLink(graph.nodes, opts);
</script>

<Plot
    x={{ axis: false }}
    y={{ axis: false }}
    color={{ type: 'categorical' }}>
    <Arrow
        {...link({ data: graph.links })}
        strokeOpacity={0.3} />
    <Dot {...node({ data: graph.nodes })} fill="group" />
</Plot>
```

## forceLayout(_nodes_, _links_, _options_)

Returns `{ nodes, links }` with computed `x` and `y` positions on each node, and `source`/`target` references resolved to node objects on each link.

The simulation runs synchronously. Complexity is O(ticks × (n log n + m)) where n = nodes and m = links. For graphs with 500+ nodes, set `charge.distanceMax` to limit charge calculations and reduce `ticks`.

### Options

| Option            | Default   | Description                            |
| ----------------- | --------- | -------------------------------------- |
| **nodeId**        | `"id"`    | Node id field name                     |
| **ticks**         | `300`     | Maximum simulation ticks               |
| **alphaDecay**    | `~0.0228` | Cooling rate — higher converges faster |
| **alphaMin**      | `0.001`   | Simulation stops below this alpha      |
| **velocityDecay** | `0.4`     | Friction/damping in [0,1]              |

### Forces

Each force accepts an options object, a number shorthand, or `false` to disable.

| Force       | Shorthand | Default             | Description                    |
| ----------- | --------- | ------------------- | ------------------------------ |
| **charge**  | strength  | `{ strength: -30 }` | Many-body repulsion/attraction |
| **center**  | strength  | `{ strength: 1 }`   | Centering force                |
| **link**    | distance  | `{ distance: 30 }`  | Link distance constraint       |
| **collide** | radius    | —                   | Collision detection            |
| **x**       | target x  | —                   | X position force               |
| **y**       | target y  | —                   | Y position force               |
| **radial**  | radius    | —                   | Radial position force          |

For example, to increase repulsion and limit charge distance for a large graph:

```ts
const { nodes, links } = forceLayout(
    graph.nodes,
    graph.links,
    {
        charge: { strength: -100, distanceMax: 200 },
        ticks: 150
    }
);
```

## forceNode(_links_, _options_) / forceLink(_nodes_, _options_)

Transform factories following the `*Node` / `*Link` convention (like [treeNode](/transforms/tree) / treeLink). These return transform functions that produce positioned data with channel mappings.

- `forceNode` returns `{ data, x: 'x', y: 'y' }` for use with Dot
- `forceLink` returns `{ data, x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2' }` with embedded coordinates for use with Arrow/Link

When both are called on the same input arrays and the same options object reference, the simulation runs only once (cached by array and options reference).
