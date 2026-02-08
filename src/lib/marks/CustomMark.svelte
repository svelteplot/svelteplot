<!--
    @component
    For showing custom SVG marks positioned at x/y coordinates
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface CustomMarkProps extends BaseMarkProps<Datum> {
        data?: Datum[];
        type?: string;
        x?: ChannelAccessor<Datum>;
        x1?: ChannelAccessor<Datum>;
        x2?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        y1?: ChannelAccessor<Datum>;
        y2?: ChannelAccessor<Datum>;
        r?: ChannelAccessor<Datum>;
        mark?: Snippet<
            [{ record: ScaledDataRecord<Datum>; index: number; usedScales: UsedScales }]
        >;
        marks?: Snippet<[{ records: ScaledDataRecord<Datum>[]; usedScales: UsedScales }]>;
    }

    import type {
        PlotContext,
        DataRecord,
        ChannelAccessor,
        BaseMarkProps,
        ScaledDataRecord,
        UsedScales,
        ScaledChannelName
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

<Mark {type} required={[]} channels={channels.filter((d) => !!options[d])} {...args}>
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
