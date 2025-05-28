<script lang="ts">
    // this component only takes care of rendering the x axis so we can re-use it
    // for the facet labels
    import { getContext, untrack } from 'svelte';
    import removeIdenticalLines from '$lib/helpers/removeIdenticalLines.js';
    import type {
        AutoMarginStores,
        ChannelAccessor,
        ConstantAccessor,
        PlotState,
        RawValue,
        ScaleType
    } from '$lib/types.js';
    import { resolveProp, resolveStyles } from '$lib/helpers/resolve.js';
    import { max } from 'd3-array';
    import { randomId, testFilter } from '$lib/helpers/index.js';

    type BaseAxisXProps = {
        scaleFn: (d: RawValue) => number;
        scaleType: ScaleType;
        ticks: RawValue[];
        tickFormat: (d: RawValue, i: number) => string | string[];
        anchor: 'top' | 'bottom';
        tickSize: number;
        tickPadding: number;
        tickFontSize: ConstantAccessor<number>;
        tickClass: ConstantAccessor<string>;
        marginTop: number;
        height: number;
        title: string;
        options: {
            dx: ConstantAccessor<number>;
            dy: ConstantAccessor<number>;
            filter: ChannelAccessor;
        };
        plot: PlotState;
    };

    let {
        scaleFn,
        scaleType,
        ticks,
        tickFormat,
        anchor,
        tickSize,
        tickPadding,
        tickFontSize,
        tickClass,
        marginTop,
        height,
        options,
        plot,
        title
    }: BaseAxisXProps = $props();

    function splitTick(tick: string | string[]) {
        return Array.isArray(tick) ? tick : [tick];
    }

    let tickRotate = $derived(plot.options.x.tickRotate || 0);

    let tickY = $derived(anchor === 'bottom' ? marginTop + height : marginTop);

    let isQuantitative = $derived(scaleType !== 'point' && scaleType !== 'band');

    // generate id used for registering margins
    const id = randomId();

    const { autoMarginTop, autoMarginBottom } =
        getContext<AutoMarginStores>('svelteplot/autoMargins');

    let tickTextElements = $state([] as SVGTextElement[]);

    const positionedTicks = $derived.by(() => {
        let tickObjects = removeIdenticalLines(
            ticks.map((tick, i) => {
                return {
                    value: tick,
                    hidden: false,
                    dx: +resolveProp(options.dx, tick, 0),
                    dy: +resolveProp(options.dy, tick, 0),
                    x: scaleFn(tick) + (scaleType === 'band' ? scaleFn.bandwidth() * 0.5 : 0),
                    text: splitTick(tickFormat(tick, i)),
                    element: null as SVGTextElement | null
                };
            })
        );
        const T = tickObjects.length;
        for (let i = 0; i < T; i++) {
            let j = i;
            // find the preceding tick that was not hidden
            do {
                j--;
            } while (j >= 0 && tickObjects[j].hidden);
            if (j >= 0) {
                const tickLabelSpace = Math.abs(tickObjects[i].x - tickObjects[j].x);
                tickObjects[i].hidden = tickLabelSpace < 15;
            }
        }
        return tickObjects;
    });

    $effect(() => {
        untrack(() => [$autoMarginTop, $autoMarginBottom]);
        const outsideTextAnchor = anchor === 'top' ? 'end' : 'start';
        // measure tick label heights
        const maxLabelHeight =
            Math.ceil(
                max(
                    positionedTicks.map((tick, i) => {
                        if (
                            resolveProp(options.anchor, tick.value, outsideTextAnchor) !==
                            outsideTextAnchor
                        )
                            return 0;
                        if (tick.hidden || !testFilter(tick.value, options)) return 0;
                        if (tickTextElements[i])
                            return tickTextElements[i].getBoundingClientRect().height;
                        return 0;
                    }) as number[]
                )
            ) +
            Math.max(0, tickPadding + tickSize) +
            (title ? 15 : 0);

        if (!isNaN(maxLabelHeight)) {
            if (anchor === 'top' && $autoMarginTop.get(id) !== maxLabelHeight) {
                $autoMarginTop.set(id, maxLabelHeight);
            } else if (anchor === 'bottom' && $autoMarginBottom.get(id) !== maxLabelHeight) {
                $autoMarginBottom.set(id, maxLabelHeight);
            }
        }
    });

    $effect(() => {
        // clear margins on destroy
        return () => {
            if ($autoMarginBottom.has(id)) $autoMarginBottom.delete(id);
            if ($autoMarginTop.has(id)) $autoMarginTop.delete(id);
        };
    });
</script>

<g class="axis-x">
    {#each positionedTicks as tick, t (t)}
        {#if testFilter(tick.value, options) && !tick.hidden}
            {@const textLines = tick.text}
            {@const prevTextLines = t && positionedTicks[t - 1].text}
            {@const fontSize = resolveProp(tickFontSize, tick)}
            {@const tickClass_ = resolveProp(tickClass, tick.value)}
            {@const estLabelWidth = max(textLines.map((t) => t.length)) * fontSize * 0.2}
            {@const moveDown =
                (tickSize + tickPadding + (tickRotate !== 0 ? tickFontSize * 0.35 : 0)) *
                (anchor === 'bottom' ? 1 : -1)}
            {@const [textStyle, textClass] = resolveStyles(
                plot,
                tick,
                {
                    fontVariant: isQuantitative ? 'tabular-nums' : 'normal',
                    ...options,
                    fontSize: tickFontSize,
                    stroke: null
                },
                'fill',
                { x: true }
            )}
            <g
                class="tick {tickClass_ || ''}"
                transform="translate({tick.x + tick.dx}, {tickY + tick.dy})"
                text-anchor={tickRotate < 0 ? 'end' : tickRotate > 0 ? 'start' : 'middle'}>
                {#if tickSize}
                    {@const [tickLineStyle, tickLineClass] = resolveStyles(
                        plot,
                        tick,
                        options,
                        'stroke',
                        { x: true }
                    )}
                    <line
                        style={tickLineStyle}
                        class={tickLineClass}
                        y2={anchor === 'bottom' ? tickSize : -tickSize} />
                {/if}

                <text
                    bind:this={tickTextElements[t]}
                    transform="translate(0, {moveDown})  rotate({tickRotate})"
                    style={textStyle}
                    class={textClass}
                    x={0}
                    y={0}
                    dominant-baseline={tickRotate !== 0
                        ? 'central'
                        : anchor === 'bottom'
                          ? 'hanging'
                          : 'auto'}>
                    {#if ticks.length > 0 || t === 0 || t === ticks.length - 1}
                        {#if textLines.length === 1}
                            {textLines[0]}
                        {:else}
                            {#each textLines as line, i (i)}
                                <tspan x="0" dy={i ? 12 : 0}
                                    >{!prevTextLines || prevTextLines[i] !== line
                                        ? line
                                        : ''}</tspan>
                            {/each}
                        {/if}
                    {/if}
                </text>
            </g>
        {/if}
    {/each}
</g>

<style>
    line {
        stroke: currentColor;
    }
    text {
        font-size: 11px;
        opacity: 0.8;
        fill: currentColor;
    }
</style>
