<script module lang="ts">
    export const title = 'Faceted marimekko chart';
    export const sortKey = 99;
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
                x: { percent: true }
            }
        )
    );
</script>

<Plot
    color={{ legend: true }}
    x={{ percent: true }}
    marginTop={15}
    marginRight={15}>
    <Rect {...stacked} inset={0.5} fill="segment" />
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
