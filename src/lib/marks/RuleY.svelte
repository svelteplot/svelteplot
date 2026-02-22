<!-- @component
    Renders horizontal rule lines at specified y positions with customizable horizontal range
-->
<script lang="ts" generics="Datum = DataRecord">
    interface RuleYMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        /** the input data array; each element becomes one horizontal rule */
        data?: Datum[];
        /** the vertical position channel for the rule */
        y?: ChannelAccessor<Datum>;
        /** the starting horizontal position of the rule */
        x1?: ChannelAccessor<Datum>;
        /** the ending horizontal position of the rule */
        x2?: ChannelAccessor<Datum>;
        /** shorthand to inset the rule from both ends, in pixels */
        inset?: ConstantAccessor<number, Datum>;
        /** inset the rule from the left, in pixels */
        insetLeft?: ConstantAccessor<number, Datum>;
        /** inset the rule from the right, in pixels */
        insetRight?: ConstantAccessor<number, Datum>;
        /** if true, renders using Canvas instead of SVG */
        canvas?: boolean;
    }
    import Mark from '../Mark.svelte';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RuleCanvas from './helpers/RuleCanvas.svelte';
    import { recordizeY } from '../transforms/recordize.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import type {
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor
    } from '../types/index.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: RuleYMarkProps = $props();
    const DEFAULTS = {
        ...getPlotDefaults().rule,
        ...getPlotDefaults().ruleY
    };
    const {
        data = [{} as Datum],
        class: className = '',
        canvas = false,
        ...options
    }: RuleYMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();
    const args = $derived(recordizeY({ data, ...options }, { withIndex: false }));
</script>

<Mark
    type="ruleY"
    channels={['y', 'x1', 'x2', 'stroke', 'opacity', 'strokeOpacity']}
    {...markProps}
    {...args}>
    {#snippet children({ scaledData, usedScales })}
        {#if canvas}
            <RuleCanvas
                data={scaledData}
                options={args}
                {usedScales}
                orientation="horizontal"
                marginLeft={plot.options.marginLeft}
                facetWidth={plot.facetWidth} />
        {:else}
            <GroupMultiple
                class="rule-y {className || ''}"
                length={className ? 2 : args.data.length}>
                {#each scaledData as d, i (i)}
                    {@const inset = resolveProp(args.inset, d.datum, 0)}
                    {@const insetLeft = resolveProp(args.insetLeft, d.datum, 0)}
                    {@const insetRight = resolveProp(args.insetRight, d.datum, 0)}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        d,
                        args,
                        'stroke',
                        usedScales
                    )}
                    <line
                        transform="translate(0, {d.y})"
                        {style}
                        class={[styleClass]}
                        x1={(inset || insetLeft) +
                            (d.x1 != null ? d.x1 : plot.options.marginLeft + d.dx)}
                        x2={(d.x2 != null
                            ? d.x2
                            : plot.facetWidth + plot.options.marginLeft + d.dx) -
                            (inset || insetRight)} />
                {/each}
            </GroupMultiple>
        {/if}
    {/snippet}
</Mark>
