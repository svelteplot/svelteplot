<script lang="ts">
    import { getContext, untrack } from 'svelte';
    import { randomId, testFilter } from '$lib/helpers/index.js';
    import { resolveProp, resolveStyles } from '$lib/helpers/resolve.js';
    import { max } from 'd3-array';
    import type {
        AutoMarginStores,
        ConstantAccessor,
        PlotState,
        RawValue,
        ScaleType
    } from '$lib/types.js';

    type BaseAxisYProps = {
        scaleFn: (d: RawValue) => number;
        scaleType: ScaleType;
        ticks: RawValue[];
        tickFormat: (d: RawValue) => string | string[];
        anchor: 'left' | 'right';
        lineAnchor: 'top' | 'center' | 'bottom';
        tickSize: number;
        tickPadding: number;
        tickFontSize: ConstantAccessor<number>;
        marginLeft: number;
        width: number;
        title: string | null;
        options: {
            dx: ConstantAccessor<number>;
            dy: ConstantAccessor<number>;
        };
        plot: PlotState;
        text: boolean | null;
    };

    let {
        scaleFn,
        scaleType,
        ticks,
        tickFormat,
        anchor,
        lineAnchor,
        tickSize,
        tickPadding,
        tickFontSize,
        tickClass,
        marginLeft,
        width,
        title,
        plot,
        options,
        text = true
    }: BaseAxisYProps = $props();

    const LINE_ANCHOR = {
        top: 'hanging',
        center: 'middle',
        bottom: 'auto'
    };

    const positionedTicks = $derived.by(() => {
        let tickObjects = ticks.map((tick, i) => {
            return {
                value: tick,
                hidden: false,
                dx: +resolveProp(options.dx, tick, 0),
                dy: +resolveProp(options.dy, tick, 0),
                y: scaleFn(tick) + (scaleType === 'band' ? scaleFn.bandwidth() * 0.5 : 0),
                text: tickFormat(tick),
                element: null as SVGTextElement | null
            };
        });
        if (text) {
            const T = tickObjects.length;
            for (let i = 0; i < T; i++) {
                let j = i;
                // find the preceding tick that was not hidden
                do {
                    j--;
                } while (j >= 0 && tickObjects[j].hidden);
                if (j >= 0) {
                    const tickLabelSpace = Math.abs(tickObjects[i].y - tickObjects[j].y);
                    tickObjects[i].hidden = tickLabelSpace < 15;
                }
            }
        }
        return tickObjects;
    });

    let tickTexts = $state([] as SVGTextElement[]);

    const isQuantitative = $derived(scaleType !== 'point' && scaleType !== 'band');

    // generate id used for registering margins
    const id = randomId();

    const { autoMarginLeft, autoMarginRight, autoMarginTop } =
        getContext<AutoMarginStores>('svelteplot/autoMargins');

    $effect(() => {
        untrack(() => [$autoMarginLeft, $autoMarginRight]);
        const outsideTextAnchor = anchor === 'left' ? 'end' : 'start';
        // measure tick label widths
        const maxLabelWidth =
            Math.ceil(
                max(
                    positionedTicks.map((tick, i) => {
                        if (
                            resolveProp(options.textAnchor, tick.value, outsideTextAnchor) !==
                            outsideTextAnchor
                        )
                            return 0;
                        if (tick.hidden || !testFilter(tick.value, options)) return 0;
                        if (tickTexts[i]) return tickTexts[i].getBoundingClientRect().width;
                        return 0;
                    }) as number[]
                )
            ) + Math.max(0, tickPadding + tickSize);

        if (!isNaN(maxLabelWidth)) {
            if (anchor === 'left' && $autoMarginLeft.get(id) !== maxLabelWidth) {
                $autoMarginLeft.set(id, maxLabelWidth);
            } else if (anchor === 'right' && $autoMarginRight.get(id) !== maxLabelWidth) {
                $autoMarginRight.set(id, maxLabelWidth);
            }
        }
    });

    $effect(() => {
        untrack(() => [$autoMarginTop]);
        if (title) {
            // add margin top to make some space for title
            $autoMarginTop.set(id, 20);
        } else {
            // no need for extra margin top
            $autoMarginTop.delete(id);
        }
    });

    $effect(() => {
        // clear margins on destroy
        return () => {
            if ($autoMarginLeft.has(id)) $autoMarginLeft.delete(id);
            if ($autoMarginRight.has(id)) $autoMarginRight.delete(id);
            if ($autoMarginTop.has(id)) $autoMarginTop.delete(id);
        };
    });
</script>

<g class="axis-y">
    {#each positionedTicks as tick, t (t)}
        {#if testFilter(tick.value, options) && !tick.hidden}
            {@const tickClass_ = resolveProp(tickClass, tick.value)}
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
                { y: true }
            )}
            <g
                class="tick {tickClass_ || ''}"
                transform="translate({tick.dx +
                    marginLeft +
                    (anchor === 'left' ? 0 : width)},{tick.y + tick.dy})">
                {#if tickSize}
                    {@const [tickLineStyle, tickLineClass] = resolveStyles(
                        plot,
                        tick,
                        options,
                        'stroke',
                        { y: true }
                    )}
                    <line
                        style={tickLineStyle}
                        class={tickLineClass}
                        x2={anchor === 'left' ? -tickSize : tickSize} />
                {/if}
                {#if text}
                    <text
                        bind:this={tickTexts[t]}
                        class={[textClass, { 'is-left': anchor === 'left' }]}
                        style={textStyle}
                        x={(tickSize + tickPadding) * (anchor === 'left' ? -1 : 1)}
                        dominant-baseline={LINE_ANCHOR[lineAnchor]}
                        >{Array.isArray(tick.text) ? tick.text.join(' ') : tick.text}</text>
                {/if}
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
    text.is-left {
        text-anchor: end;
    }
</style>
