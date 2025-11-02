---
title: Image mark
---

:::info
added in 0.6.0
:::

The Image mark renders images positioned at x/y coordinates. It’s useful for photo scatterplots, beeswarms with thumbnails, and similar layouts.

```svelte live
<script lang="ts">
    import { Plot, Image } from 'svelteplot';
    import { page } from '$app/state';
    import RuleY from 'svelteplot/marks/RuleY.svelte';
    const { presidents2 } = $derived(page.data.data);
</script>

<Plot grid inset={20}>
    <RuleY y={0} />
    <Image
        data={presidents2}
        x="First Inauguration Date"
        y={(d) =>
            d['Very Favorable %'] +
            d['Somewhat Favorable %'] -
            d['Very Unfavorable %'] -
            d['Somewhat Unfavorable %']}
        src="Portrait URL"
        width={30} />
</Plot>
```

```svelte
<Plot grid inset={20}>
    <RuleY y={0} />
    <Image
        data={presidents}
        x="First Inauguration Date"
        y={(d) =>
            d['Very Favorable %'] +
            d['Somewhat Favorable %'] -
            d['Very Unfavorable %'] -
            d['Somewhat Unfavorable %']}
        src="Portrait URL"
        width={30} />
</Plot>
```

Here’s an example using dodgeY to create a beeswarm of presidential portraits along a time axis:

```svelte live
<script lang="ts">
    import { Plot, Image } from 'svelteplot';
    import { page } from '$app/state';
    const { presidents2 } = $derived(page.data.data);
</script>

<Plot
    y={{ axis: false }}
    inset={20}
    height={(w) => Math.sqrt(1 / w) * 8e3}>
    <Image
        data={presidents2}
        x="First Inauguration Date"
        dodgeY="bottom"
        y={0.01}
        src="Portrait URL"
        title="Name"
        r={20} />
</Plot>
```

## Image options

- x, y — position accessors for each datum
- r — radius; when set, width and height are derived as 2 × r and a circular clip-path is applied
- width — image width (number or accessor); default 20
- height — image height (number or accessor); defaults to width when unspecified
- src — image source URL (string or accessor)
- title — optional title for the image; shown via an SVG <title> element
- preserveAspectRatio — passed to the SVG image element; default xMidYMin slice
- imageClass — class name applied to the image element (string or accessor)
- href — wraps each image in an <a> link if provided; supports target, rel, type, download, and data-sveltekit-\* attributes
- Common mark props — supports styling and events from BaseMarkProps (e.g., fill, stroke, opacity, dx, dy, pointer handlers)
