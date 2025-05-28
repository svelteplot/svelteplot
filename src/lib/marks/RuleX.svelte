<!-- @component
    Renders vertical rule lines at specified x positions with customizable vertical range
-->
<script module lang="ts">
    export type RuleXMarkProps = Omit<BaseMarkProps, 'fill' | 'fillOpacity'> & {
        data: DataRecord[];
        x?: ChannelAccessor;
        y1?: ChannelAccessor;
        y2?: ChannelAccessor;
        inset?: ConstantAccessor<number>;
        insetTop?: ConstantAccessor<number>;
        insetBottom?: ConstantAccessor<number>;
    };
</script>

<script lang="ts">
    import Mark from '../Mark.svelte';
    import GroupMultiple from '$lib/marks/helpers/GroupMultiple.svelte';
    import { getContext } from 'svelte';
    import { recordizeX } from '$lib/transforms/recordize.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor
    } from '../types.js';

    let { data = [{}], class: className = null, ...options }: RuleXMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());
    const args = $derived(recordizeX({ data, ...options }, { withIndex: false }));
</script>

<Mark type="ruleX" channels={['x', 'y1', 'y2', 'stroke', 'opacity', 'strokeOpacity']} {...args}>
    {#snippet children({ mark, scaledData, usedScales })}
        <GroupMultiple class="rule-x {className || ''}" length={className ? 2 : scaledData.length}>
            {#each scaledData as d, i (i)}
                {@const inset = resolveProp(args.inset, d.datum, 0)}
                {@const insetTop = resolveProp(args.insetTop, d.datum, 0)}
                {@const insetBottom = resolveProp(args.insetBottom, d.datum, 0)}
                {@const dx = resolveProp(args.dx, d.datum, 0)}
                {@const dy = resolveProp(args.dy, d.datum, 0)}
                {@const [style, styleClass] = resolveStyles(plot, d, args, 'stroke', usedScales)}
                <line
                    transform="translate({d.x + dx}, {dy})"
                    {style}
                    class={[styleClass]}
                    y1={(inset || insetTop) + (d.y1 != null ? d.y1 : plot.options.marginTop)}
                    y2={(d.y2 != null ? d.y2 : plot.facetHeight + plot.options.marginTop) -
                        (inset || insetBottom)} />
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>
