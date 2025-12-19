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
        BorderRadius
    } from '$lib/types';
    import { wafflePolygon, type WaffleOptions } from './helpers/waffle';
    import { getPlotDefaults } from '$lib/hooks/plotDefaults';
    import { intervalY, recordizeY, sort, stackY } from '$lib/transforms';
    import Mark from 'svelteplot/Mark.svelte';
    import { resolveProp, resolveStyles } from 'svelteplot/helpers/resolve';
    import { roundedRect } from 'svelteplot/helpers/roundedRect';
    import GroupMultiple from './helpers/GroupMultiple.svelte';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    interface WaffleYMarkProps
        extends BaseMarkProps<Datum>, LinkableMarkProps<Datum>, WaffleOptions<Datum> {
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
    }

    const DEFAULTS = {
        ...getPlotDefaults().waffle,
        ...getPlotDefaults().waffleY
    };

    let markProps: WaffleYMarkProps = $props();

    const {
        data = [{} as Datum],
        class: className = null,
        stack,
        symbol = null,
        ...options
    }: WaffleYMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const plot = usePlot();

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

<Mark
    type="waffleY"
    requiredScales={{ x: ['band'] }}
    channels={['y1', 'y2', 'x', 'fill', 'stroke', 'opacity', 'fillOpacity', 'strokeOpacity']}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        {@const wafflePoly = wafflePolygon('y', args, plot.scales)}
        {#each scaledData as d, i (i)}
            {@const [style, styleClass] = resolveStyles(
                plot,
                d,
                args,
                args.stroke && !args.fill ? 'stroke' : 'fill',
                usedScales
            )}
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
            {@const { pattern, rect, path } = wafflePoly(d)}
            <g class={['waffle-y', className]}>
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
