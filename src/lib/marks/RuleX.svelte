<!-- @component
    Renders vertical rule lines at specified x positions with customizable vertical range
-->
<script lang="ts" generics="Datum = DataRecord | RawValue">
    interface RuleXMarkProps extends Omit<BaseMarkProps<Datum>, 'fill' | 'fillOpacity'> {
        /** the input data array; each element becomes one vertical rule */
        data?: Datum[];
        /** the horizontal position channel for the rule */
        x?: ChannelAccessor<Datum>;
        /** the starting vertical position of the rule */
        y1?: ChannelAccessor<Datum>;
        /** the ending vertical position of the rule */
        y2?: ChannelAccessor<Datum>;
        /** shorthand to inset the rule from both ends, in pixels */
        inset?: ConstantAccessor<number, Datum>;
        /** inset the rule from the top, in pixels */
        insetTop?: ConstantAccessor<number, Datum>;
        /** inset the rule from the bottom, in pixels */
        insetBottom?: ConstantAccessor<number, Datum>;
        /** if true, renders using Canvas instead of SVG */
        canvas?: boolean;
    }
    import Mark from '../Mark.svelte';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import RuleCanvas from './helpers/RuleCanvas.svelte';
    import { recordizeX } from '../transforms/recordize.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import type {
        DataRecord,
        DataRow,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        RawValue
    } from '../types/index.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    let markProps: RuleXMarkProps = $props();
    const DEFAULTS = {
        ...getPlotDefaults().rule,
        ...getPlotDefaults().ruleX
    };
    const {
        data = [{} as Datum],
        class: className = '',
        canvas = false,
        ...options
    }: RuleXMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();
    const args = $derived(
        recordizeX({ data: data as DataRow[], ...options }, { withIndex: false })
    );
</script>

<Mark type="ruleX" channels={['x', 'y1', 'y2', 'stroke', 'opacity', 'strokeOpacity']} {...args}>
    {#snippet children({ mark, scaledData, usedScales })}
        {#if canvas}
            <RuleCanvas
                data={scaledData}
                options={args as any}
                {usedScales}
                orientation="vertical"
                marginTop={plot.options.marginTop}
                facetHeight={plot.facetHeight} />
        {:else}
            <GroupMultiple
                class="rule-x {className || ''}"
                length={className ? 2 : scaledData.length}>
                {#each scaledData as d, i (i)}
                    {@const inset = resolveProp(args.inset, d.datum, 0) as number}
                    {@const insetTop = resolveProp(args.insetTop, d.datum, 0) as number}
                    {@const insetBottom = resolveProp(args.insetBottom, d.datum, 0) as number}
                    {@const [style, styleClass] = resolveStyles(
                        plot,
                        d,
                        args as any,
                        'stroke',
                        usedScales
                    )}
                    <line
                        transform="translate({d.x}, 0)"
                        {style}
                        class={[styleClass]}
                        y1={(inset || insetTop) +
                            (d.y1 != null ? d.y1 : plot.options.marginTop + d.dy)}
                        y2={(d.y2 != null
                            ? d.y2
                            : plot.facetHeight + plot.options.marginTop + d.dy) -
                            (inset || insetBottom)} />
                {/each}
            </GroupMultiple>
        {/if}
    {/snippet}
</Mark>
