<script module lang="ts">
    export const title = 'Mosaic/Marimekko chart';
    export const sortKey = 98;
    // export const repl =
    // 'https://svelte.dev/playground/7a6b0ae12c624ffeb52448adac644b5b?version=5.33.18';
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
    x={{ percent: true }}
    y={{ percent: true }}
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
</Plot>
