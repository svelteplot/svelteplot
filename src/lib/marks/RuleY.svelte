<!-- @component
    Renders horizontal rule lines at specified y positions with customizable horizontal range
-->
<script lang="ts" generics="Datum = DataRecord">
    interface RuleYMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        data?: Datum[];
        y?: ChannelAccessor<Datum>;
        x1?: ChannelAccessor<Datum>;
        x2?: ChannelAccessor<Datum>;
        inset?: ConstantAccessor<number, Datum>;
        insetLeft?: ConstantAccessor<number, Datum>;
        insetRight?: ConstantAccessor<number, Datum>;
    }
    import Mark from '../Mark.svelte';
    import GroupMultiple from '$lib/marks/helpers/GroupMultiple.svelte';
    import { getContext } from 'svelte';
    import { recordizeY } from '$lib/transforms/recordize.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor
    } from '../types/index.js';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults.js';

    let markProps: RuleYMarkProps = $props();
    const DEFAULTS = {
        ...getPlotDefaults().rule,
        ...getPlotDefaults().ruleY
    };
    const {
        data = [{} as Datum],
        class: className = '',
        ...options
    }: RuleYMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());
    const args = $derived(recordizeY({ data, ...options }, { withIndex: false }));
</script>

<Mark type="ruleY" channels={['y', 'x1', 'x2', 'stroke', 'opacity', 'strokeOpacity']} {...args}>
    {#snippet children({ scaledData, usedScales })}
        <GroupMultiple class="rule-y {className || ''}" length={className ? 2 : args.data.length}>
            {#each scaledData as d, i (i)}
                {@const inset = resolveProp(args.inset, d.datum, 0)}
                {@const insetLeft = resolveProp(args.insetLeft, d.datum, 0)}
                {@const insetRight = resolveProp(args.insetRight, d.datum, 0)}
                {@const [style, styleClass] = resolveStyles(plot, d, args, 'stroke', usedScales)}
                <line
                    transform="translate(0, {d.y})"
                    {style}
                    class={[styleClass]}
                    x1={(inset || insetLeft) +
                        (d.x1 != null ? d.x1 : plot.options.marginLeft + d.dx)}
                    x2={(d.x2 != null ? d.x2 : plot.facetWidth + plot.options.marginLeft + d.dx) -
                        (inset || insetRight)} />
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>
