<!--
    @component
    The waffleX mark lets you create waffle charts by filling a rectangular area with small squares representing data values.
-->
<script lang="ts" generics="Datum extends DataRecord">
    import type {
        DataRecord,
        ChannelAccessor,
        BaseMarkProps,
        LinkableMarkProps,
        PlotContext
    } from '$lib/types';
    import type { WaffleOptions } from './helpers/waffle';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults';
    import { getContext } from 'svelte';
    import { intervalY, recordizeY, sort, stackY } from '$lib/transforms';

    interface WaffleYMarkProps
        extends BaseMarkProps<Datum>,
            LinkableMarkProps<Datum>,
            WaffleOptions {
        data?: Datum[];
        /**
         * bound to a babd scale
         */
        x?: ChannelAccessor<Datum>;
        /**
         * bound to a quantitative scale
         */
        y?: ChannelAccessor<Datum>;
        /**
         * bound to a quantitative scale
         */
        y1?: ChannelAccessor<Datum>;
        /**
         * bound to a quantitative scale
         */
        y2?: ChannelAccessor<Datum>;
        stack?: StackOptions;
    }

    const DEFAULTS = {
        fill: 'currentColor',
        ...getPlotDefaults().waffle,
        ...getPlotDefaults().waffleY
    };

    let markProps: WaffleYMarkProps = $props();

    const {
        data = [{} as Datum],
        class: className = null,
        stack,
        ...options
    }: WaffleYMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const args = $derived(
        stackY(
            intervalY(
                // by default, sort by y channel (the ordinal labels)
                sort(recordizeY({ data, ...options })),
                { plot }
            ),
            stack
        )
    );
</script>
