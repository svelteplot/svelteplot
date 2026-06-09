---
title: Jitter transform
---

When x values are discrete integers — like cylinder counts — points stack exactly on top of each other. Opacity helps a little, but you still can't tell how many points share a position.

The `jitterX` transform adds a small random horizontal nudge to each point. Import it alongside your marks:

```svelte
---import { Plot, Dot } from 'svelteplot';---
+++import { Plot, Dot, jitterX } from 'svelteplot';+++
```

Compute the jittered channels in a `$derived` block, then spread the result onto `<Dot>`:

```svelte
+++const jittered = $derived(
  jitterX({ data, x: 'cylinders', y: 'power (hp)' }, { type: 'uniform', width: 0.45 })
);+++
```

```svelte
---<Dot {data} x="cylinders" y="power (hp)" opacity={0.5} />---
+++<Dot {...jittered} opacity={0.5} />+++
```

The `width` option controls how far points can spread (in data units — here ±0.45 cylinders). Only the positional channels go through the transform; any other props like `opacity` are passed directly to `<Dot>`.
