<!-- @component
    Renders horizontal rule lines at specified y positions with customizable horizontal range
-->
<script module lang="ts">
    export type RuleYMarkProps = Omit<BaseMarkProps, 'fill' | 'fillOpacity'> & {
        data: DataRecord[];
        y?: ChannelAccessor;
        x1?: ChannelAccessor;
        x2?: ChannelAccessor;
        inset?: ConstantAccessor<number>;
        insetLeft?: ConstantAccessor<number>;
        insetRight?: ConstantAccessor<number>;
    };
</script>

<script lang="ts">
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
    } from '../types.js';

    let { data = [{}], class: className = null, ...options }: RuleYMarkProps = $props();

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
                {@const dx = resolveProp(args.dx, d.datum, 0)}
                {@const dy = resolveProp(args.dy, d.datum, 0)}
                {@const [style, styleClass] = resolveStyles(plot, d, args, 'stroke', usedScales)}
                <line
                    transform="translate({dx}, {d.y + dy})"
                    {style}
                    class={[styleClass]}
                    x1={(inset || insetLeft) + (d.x1 != null ? d.x1 : plot.options.marginLeft)}
                    x2={(d.x2 != null ? d.x2 : plot.facetWidth + plot.options.marginLeft) -
                        (inset || insetRight)} />
            {/each}
        </GroupMultiple>
    {/snippet}
</Mark>
