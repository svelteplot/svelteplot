<script module lang="ts">
    export const title = 'Faceted marimekko chart';
    // export const repl =
    // 'https://svelte.dev/playground/7a6b0ae12c624ffeb52448adac644b5b?version=5.33.18';
</script>

<script lang="ts">
    import {
        HTMLTooltip,
        Plot,
        Rect,
        Dot,
        Text,
        stackMarimekko
    } from 'svelteplot';
    import { Checkbox } from '$lib/ui';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    const { sales2 } = $derived(
        page.data.data
    ) as ExamplesData;

    let xPercent = $state(true);
    let yPercent = $state(true);

    const stacked = $derived(
        stackMarimekko(
            {
                data: sales2,
                x: 'market',
                fx: 'quarter',
                y: 'segment',
                value: 'value'
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
    {#snippet overlay()}
        <HTMLTooltip {...stacked} r={5}>
            {#snippet children({ datum })}
                {datum.market}<br />
                {datum.segment}<br />
                {datum.value}
            {/snippet}
        </HTMLTooltip>
    {/snippet}
</Plot>
