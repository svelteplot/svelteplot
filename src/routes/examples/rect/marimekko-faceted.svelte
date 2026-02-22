<script module lang="ts">
    export const title = 'Faceted mosaic chart';
    export const sortKey = 99;
    export const transforms = ['stack'];
    export const data = { sales2: '/data/sales2.csv' };
</script>

<script lang="ts">
    import {
        HTMLTooltip,
        Plot,
        Rect,
        stackMosaicX
    } from 'svelteplot';
    import { Checkbox } from '$shared/ui';

    const { sales2 } = $props();

    const stacked = $derived(
        stackMosaicX(
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
    <Rect
        {...stacked}
        inset={0.5}
        fx="quarter"
        fill="segment" />
    {#snippet overlay()}
        <HTMLTooltip {...stacked} r={5}>
            {#snippet children({ datum })}
                <div class="tooltip">
                    {datum.market}<br />
                    {datum.segment}<br />
                    {datum.value}
                </div>
            {/snippet}
        </HTMLTooltip>
    {/snippet}
</Plot>

<style>
    .tooltip {
        background: var(--svelteplot-tooltip-bg);
        border-color: var(--svelteplot-tooltip-border);
        font-size: 12px;
        padding: 1ex 1em;
        border-radius: 3px;
        line-height: 1.2;
        box-shadow:
            rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
            rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    }
</style>
