<script module lang="ts">
    export const title = 'Mosaic/Marimekko chart';
    export const sortKey = 98;
    // export const repl =
    // 'https://svelte.dev/playground/8426ef943f63404d8efd40831667ff9e?version=latest';
</script>

<script lang="ts">
    import {
        Plot,
        Rect,
        Text,
        stackMosaicX
    } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    import { groups } from 'd3-array';

    const { sales } = $derived(
        page.data.data
    ) as ExamplesData;

    const stacked = $derived(
        stackMosaicX(
            {
                data: sales,
                x: 'market',
                y: 'segment',
                value: 'value'
            },
            {
                x: { percent: true },
                y: { percent: true }
            }
        )
    );
</script>

<Plot
    frame
    x={{ percent: true, label: false }}
    y={{ percent: true, label: false }}
    marginTop={15}
    marginRight={15}>
    <Rect
        {...stacked}
        inset={0.5}
        opacity={0.5}
        fill="segment" />
    <Text
        {...stacked}
        fontSize={9}
        text={(d) =>
            [d.market, d.segment, d.value].join('\n')} />
    <!-- add horizontal group labels -->
    <Text
        data={groups(stacked.data, (d) => d.market).map(
            ([text, g]) => ({ text, x: g[0][stacked.x] })
        )}
        x="x"
        text="text"
        lineAnchor="bottom"
        fontSize={10}
        dy={-5}
        frameAnchor="top" />
    <!-- add vertical group labels -->
    <Text
        data={groups(stacked.data, (d) => d.segment).map(
            ([text, g]) => ({
                text,
                y: g.at(-1)[stacked.y]
            })
        )}
        y="y"
        text="text"
        lineAnchor="bottom"
        textAnchor="middle"
        fontSize={10}
        rotate={90}
        dx={5}
        frameAnchor="right" />
</Plot>
