<!--
    @component
    For showing custom SVG marks positioned at x/y coordinates
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface CustomMarkProps extends BaseMarkProps<Datum> {
        /** the input data array */
        data?: Datum[];
        /** the horizontal position channel; bound to the x scale */
        x?: ChannelAccessor<Datum>;
        /** the starting horizontal position; bound to the x scale */
        x1?: ChannelAccessor<Datum>;
        /** the ending horizontal position; bound to the x scale */
        x2?: ChannelAccessor<Datum>;
        /** the vertical position channel; bound to the y scale */
        y?: ChannelAccessor<Datum>;
        /** the starting vertical position; bound to the y scale */
        y1?: ChannelAccessor<Datum>;
        /** the ending vertical position; bound to the y scale */
        y2?: ChannelAccessor<Datum>;
        /** the radius channel; bound to the r scale */
        r?: ChannelAccessor<Datum>;
        /** snippet rendered once per data point with the scaled record */
        mark?: Snippet<
            [{ record: ScaledDataRecord<Datum>; index: number; usedScales: UsedScales }]
        >;
        /** snippet rendered once with all scaled records */
        marks?: Snippet<[{ records: ScaledDataRecord<Datum>[]; usedScales: UsedScales }]>;
    }

    import type {
        PlotContext,
        DataRecord,
        ChannelAccessor,
        BaseMarkProps,
        ScaledDataRecord,
        UsedScales,
        ScaledChannelName,
        MarkType
    } from 'svelteplot/types/index.js';
    import type { Snippet } from 'svelte';
    import { sort } from '../index.js';

    import Mark from 'svelteplot/Mark.svelte';

    let {
        data = [{} as Datum],
        mark,
        type = 'custom',
        marks,
        ...options
    }: CustomMarkProps = $props();

    const args = $derived(sort({ data, ...options })) as CustomMarkProps;

    const channels: ScaledChannelName[] = [
        'x',
        'x1',
        'x2',
        'y',
        'y1',
        'y2',
        'r',
        'fill',
        'stroke',
        'opacity',
        'fillOpacity',
        'strokeOpacity'
    ];
</script>

<Mark type="custom" required={[]} channels={channels.filter((d) => !!options[d])} {...args}>
    {#snippet children({ scaledData, usedScales })}
        {#if marks}
            {@render marks({ records: scaledData.filter((d) => d.valid), usedScales })}
        {/if}
        {#if mark}
            {#each scaledData as datum, i (i)}
                {#if datum.valid}
                    {@render mark({ record: datum, index: i, usedScales })}
                {/if}
            {/each}
        {/if}
    {/snippet}
</Mark>
