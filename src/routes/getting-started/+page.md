---
title: Getting started
description: This page explains how to start using SveltePlot.
---

:::caution
Welcome! SveltePlot is still in an alpha stage, and its API may change. The documentation is still incomplete and of varying quality. Use at your own risk, and please [get in touch](https://discord.gg/BJ5CJgDqWV) if you'd like to contribute.
:::

## Try SveltePlot online

You can use SveltePlot inside any platform that supports Svelte 5, such as [StackBlitz](https://stackblitz.com/edit/vitejs-vite-mh9ogv?file=src%2FApp.svelte&terminal=dev). You can click the "Fork" button next to all examples in the SveltePlot documenation to edit them in the **Svelte playground**.

```svelte live
<script>
    import { Plot, RectY, binX } from '$lib/index';
    import { randomNormal } from 'd3-random';

    const randomNumbers = new Array(10000)
        .fill(0)
        .map(randomNormal());
</script>

<Plot title="Histogram of random numbers" grid>
    <RectY
        {...binX(
            { data: randomNumbers },
            { y: 'count' }
        )} />
</Plot>
```

[Fork](https://svelte.dev/playground/db6bcdf02859413fa9b3af456f9b9047).

```svelte
<script>
    import { Plot, RectY, binX } from 'svelteplot';
    import { range } from 'd3-array';
    import { randomNormal } from 'd3-random';
</script>

<Plot grid>
    <RectY
        {...binX(
            { data: range(10000).map(randomNormal()) },
            { y: 'count' }
        )} />
</Plot>
```

## Use SveltePlot in Svelte 5

Just install SveltePlot via `npm` or `pnpm`

```sh
npm install svelteplot
# or
pnpm add svelteplot
```

..and import and use the components!

```svelte
<script>
    import { Plot, BarX } from 'svelteplot';
</script>

<Plot grid>
    <BarX data={[1, 2, 3, 4]} />
</Plot>
```

```svelte live
<script>
    import { Plot, BarX } from '$lib/index';
</script>

<Plot grid testid="four-bars">
    <BarX data={[1, 2, 3, 4]} />
</Plot>
```

[Fork](https://svelte.dev/playground/7637c04038f14499a7230af60def22b5?version=5.14.0)

## Use SveltePlot in vanilla HTML

The core idea of SveltePlot is to be used in Svelte applications, but Svelte being Svelte, nothing is stopping you from pre-compiling your visualization code (including the Svelte runtime) as a standalone JavaScript bundle and embedding it anywhere you want.

All you need for this is to clone this starter repo (TODO) and run `npm run build`.

## Can I use SveltePlot in Svelte 4?

Unfortunately, SveltePlot is not compatible with Svelte 4 projects due to it's heavy use of [runes](https://svelte.dev/docs/svelte/what-are-runes). However, upgrading your project to Svelte 5 should be relatively easy since it is mostly backwards compatible. This means that the majority of your existing code should work without major modifications.

You can follow the official [Svelte 5 documentation](https://svelte.dev/docs/svelte/) on how to [upgrade your project](https://svelte.dev/docs/svelte/v5-migration-guide).

## Use SveltePlot in React, Vue, etc.

I wouldn't recommend this. Just use [Observable Plot](https://observablehq.com/plot/getting-started#plot-in-react) directly.
