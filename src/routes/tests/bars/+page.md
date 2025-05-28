---
title: Trying to cut off bars
---

```svelte live
<script>
    import { Plot, BarY, Text, stackY } from 'svelteplot';
    import { page } from '$app/state';
    let { bundlesizes } = $derived(page.data.data);
</script>

<Plot height={500} x={{ domain: ['normal', 'core', 'd3'] }}>
    <BarY
        data={bundlesizes}
        y="size"
        insetTop={1}
        borderRadius={4}
        x="scenario"
        {...stackY({
            data: bundlesizes,
            y: 'size',
            x: 'scenario',
            fill: 'package'
        })} />
    <BarY
        data={bundlesizes}
        y="size"
        insetTop={2}
        borderRadius={4}
        x="scenario"
        fill="package" />
    <!-- <Text
        {...stackY({
            data: bundlesizes,
            y: 'size',
            x: 'scenario',
            z: 'package'
        })}
        y={(d) => (d.__y1 + d.__y2) * 0.5}
        text="package"
        fill="white"
        stroke="black"
        strokeOpacity="0.4"
        strokeWidth="2" /> -->
</Plot>
```
