<!--
    @component
    For showing custom SVG marks positioned at x/y coordinates
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface CustomMarkProps extends BaseMarkProps<Datum> {
        data: Datum[];
        x?: ChannelAccessor<Datum>;
        x1?: ChannelAccessor<Datum>;
        x2?: ChannelAccessor<Datum>;
        y?: ChannelAccessor<Datum>;
        y1?: ChannelAccessor<Datum>;
        y2?: ChannelAccessor<Datum>;
        r?: ChannelAccessor<Datum>;
        children: Snippet<
            [{ record: ScaledDataRecord<Datum>; index: number; usedScales: UsedScales }]
        >;
    }

    import { getContext } from 'svelte';
    import type {
        PlotContext,
        DataRecord,
        ChannelAccessor,
        BaseMarkProps,
        ScaledDataRecord,
        UsedScales
    } from 'svelteplot/types/index.js';
    import type { Snippet } from 'svelte';
    import { sort } from '$lib/index.js';
    const { getPlotState } = getContext<PlotContext>('svelteplot');
    let plot = $derived(getPlotState());

    import Mark from 'svelteplot/Mark.svelte';

    let { data = [{} as Datum], children: customMark, ...options }: CustomMarkProps = $props();

    const args = $derived(sort({ data, ...options })) as CustomMarkProps;
</script>

<Mark
    type="custom"
    required={['x', 'y']}
    channels={['x', 'y', 'r', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ scaledData, usedScales })}
        {#each scaledData as datum, i (i)}
            {#if datum.valid}
                {@render customMark({ record: datum, index: i, usedScales })}
            {/if}
        {/each}
    {/snippet}
</Mark>
