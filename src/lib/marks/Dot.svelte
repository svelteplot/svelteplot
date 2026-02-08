<!-- @component
    Creates dots or symbols at specified positions with customizable size and appearance
-->
<script lang="ts" generics="Datum extends DataRecord">
    interface DotMarkProps extends BaseMarkProps<Datum>, LinkableMarkProps<Datum> {
        data: Datum[];
        x: ChannelAccessor<Datum>;
        y: ChannelAccessor<Datum>;
        r?: ChannelAccessor<Datum>;
        symbol?: ChannelAccessor<Datum> | Snippet<[number, string]>;
        canvas?: boolean;
        dotClass?: ConstantAccessor<string, Datum>;
    }

    import { type Snippet } from 'svelte';
    import type {
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        LinkableMarkProps
    } from '../types/index.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { maybeSymbol } from '../helpers/symbols.js';
    import { symbol as d3Symbol } from 'd3-shape';
    import { sort } from '../index.js';
    import Mark from '../Mark.svelte';
    import DotCanvas from './helpers/DotCanvas.svelte';
    import { isValid } from '../helpers/index.js';
    import { recordizeXY } from '../transforms/recordize.js';
    import { addEventHandlers } from './helpers/events.js';
    import Anchor from './helpers/Anchor.svelte';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { isOrdinalScale } from 'svelteplot/helpers/scales.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    const DEFAULTS = {
        ...getPlotDefaults().dot
    };

    let markProps: DotMarkProps = $props();

    const {
        data = [{} as Datum],
        canvas = false,
        class: className = '',
        dotClass = null,
        ...options
    }: DotMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const plot = usePlot();

    function getSymbolPath(symbolType, size) {
        return d3Symbol(maybeSymbol(symbolType), size)();
    }

    const args = $derived(
        // todo: move sorting to Mark
        sort(
            recordizeXY({
                data,
                // sort by descending radius by default
                ...(options.r &&
                !isOrdinalScale(plot.scales.x.type) &&
                !isOrdinalScale(plot.scales.y.type)
                    ? { sort: { channel: '-r' } }
                    : {}),
                ...options,
                ...(options.fill === true ? { fill: 'currentColor' } : {})
            })
        )
    );
</script>

<Mark
    type="dot"
    required={['x', 'y']}
    channels={[
        'x',
        'y',
        'r',
        'symbol',
        'fill',
        'opacity',
        'stroke',
        'fillOpacity',
        'strokeOpacity'
    ]}
    defaults={{ x: 0, y: 0, r: 3, symbol: 'circle' }}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        <g class="dot {className || ''}">
            {#if canvas}
                <DotCanvas data={scaledData} {mark} />
            {:else}
                {#each scaledData as d, i (i)}
                    {#if d.valid && isValid(d.r)}
                        {@const [style, styleClass] = resolveStyles(
                            plot,
                            d,
                            { strokeWidth: 1.6, ...args },
                            'stroke',
                            usedScales
                        )}
                        <Anchor {options} datum={d.datum}>
                            <path
                                transform="translate({d.x}, {d.y})"
                                d={getSymbolPath(d.symbol, d.r ** 2 * Math.PI)}
                                class={[
                                    dotClass ? resolveProp(dotClass, d.datum, null) : null,
                                    styleClass
                                ]}
                                {style}
                                {@attach addEventHandlers({
                                    plot,
                                    options: args,
                                    datum: d?.datum
                                })} />
                        </Anchor>
                    {/if}
                {/each}
            {/if}
        </g>
    {/snippet}
</Mark>
