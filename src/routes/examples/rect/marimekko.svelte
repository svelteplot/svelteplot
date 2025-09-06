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
        stackMosaic
    } from 'svelteplot';
    import { Checkbox } from '$lib/ui';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    const { sales } = $derived(
        page.data.data
    ) as ExamplesData;

    let xPercent = $state(true);
    let yPercent = $state(true);
    let sortValue = $state(false);

    const stacked = $derived(
        stackMosaic(
            {
                data: sales,
                x: 'market',
                y: 'segment',
                value: 'value',
                ...(sortValue ? { sort: 'value' } : {})
            },
            {
                x: { percent: xPercent },
                y: { percent: yPercent }
            }
        )
    );
</script>

<Checkbox
    bind:value={xPercent}
    label="stack x percentages" />
<Checkbox
    bind:value={yPercent}
    label="stack y percentages" />
<Checkbox bind:value={sortValue} label="sort by value" />

<Plot
    frame
    x={{ percent: xPercent }}
    y={{ percent: yPercent }}
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
