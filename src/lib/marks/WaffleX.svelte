<!--
    @component
    The waffleX mark lets you create waffle charts by filling a rectangular area with small squares representing data values.
-->
<script lang="ts" generics="Datum extends DataRecord">
    import type {
        DataRecord,
        BaseMarkProps,
        ChannelAccessor,
        LinkableMarkProps,
        BorderRadius
    } from 'svelteplot/types';
    import { wafflePolygon, type WaffleOptions } from './helpers/waffle';
    import { getPlotDefaults } from 'svelteplot/hooks/plotDefaults';
    import { intervalX, recordizeX, sort, stackX } from 'svelteplot/transforms';
    import type { StackOptions } from 'svelteplot/transforms/stack';
    import Mark from '$lib/Mark.svelte';
    import { resolveProp, resolveStyles } from 'svelteplot/helpers/resolve';
    import { roundedRect } from 'svelteplot/helpers/roundedRect';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    interface WaffleXMarkProps
        extends BaseMarkProps<Datum>, LinkableMarkProps<Datum>, WaffleOptions<Datum> {
        data?: Datum[];
        /**
         * bound to a quantitative scale
         */
        x?: ChannelAccessor<Datum>;
        /**
         * bound to a quantitative scale
         */
        x1?: ChannelAccessor<Datum>;
        /**
         * bound to a quantitative scale
         */
        x2?: ChannelAccessor<Datum>;
        /**
         * bound to a band scale
         */
        y?: ChannelAccessor<Datum>;
        stack?: StackOptions;
    }

    const DEFAULTS = {
        fill: 'currentColor',
        ...getPlotDefaults().waffle,
        ...getPlotDefaults().waffleX
    };

    let markProps: WaffleXMarkProps = $props();

    const {
        data = [{} as Datum],
        class: className = null,
        stack,
        symbol = null,
        unit,
        ...options
    }: WaffleXMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const plot = usePlot();

    const args = $derived(
        stackX(
            intervalX(
                // by default, sort by y channel (the ordinal labels)
                sort(recordizeX({ data, ...options }))
            ),
            stack
        )
    );
</script>

<Mark
    type="waffleX"
    requiredScales={{ y: ['band'] }}
    channels={['x1', 'x2', 'y', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const wafflePoly = wafflePolygon('x', args, plot.scales)}
        {#each scaledData as d, i (i)}
            {@const borderRadius = resolveProp(args.borderRadius, d?.datum, 0) as BorderRadius}
            {@const hasBorderRadius =
                (typeof borderRadius === 'number' && borderRadius > 0) ||
                (typeof borderRadius === 'object' &&
                    Math.max(
                        borderRadius.topRight ?? 0,
                        borderRadius.bottomRight ?? 0,
                        borderRadius.topLeft ?? 0,
                        borderRadius.bottomLeft ?? 0
                    ) > 0)}
            {@const [style, styleClass] = resolveStyles(plot, d, options, 'fill', usedScales)}
            {@const { pattern, rect, path } = wafflePoly(d)}
            <g class={['waffle-x', className]}>
                <pattern {...pattern}>
                    {#if symbol}
                        {@render symbol({ ...rect, style, styleClass, datum: d.datum })}
                    {:else if hasBorderRadius}
                        <path
                            d={roundedRect(rect.x, rect.y, rect.width, rect.height, borderRadius)}
                            {style}
                            class={styleClass} />
                    {:else}
                        <rect {style} class={styleClass} {...rect} />
                    {/if}
                </pattern>
                <path {...path} />
            </g>
        {/each}
    {/snippet}
</Mark>
