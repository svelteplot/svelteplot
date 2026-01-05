---
title: Map transform
---

[API Reference](/api/transforms)

```svelte live
<script>
    import { Plot, BarX, mapX } from 'svelteplot';
</script>

<Plot y={{ type: 'band' }}>
    <BarX
        {...mapX(
            {
                data: [
                    { x: 1, v: 1 },
                    { x: 2, v: 2 },
                    { x: 3, v: -1 },
                    { x: 4, v: 4 },
                    { x: 5, v: 5 }
                ],
                x: 'v',
                y: 'x'
            },
            'cumsum'
        )} />
</Plot>
```

## map

[API Reference](/api/transforms#map)

## mapX

[API Reference](/api/transforms#mapX)

## mapY

[API Reference](/api/transforms#mapY)
