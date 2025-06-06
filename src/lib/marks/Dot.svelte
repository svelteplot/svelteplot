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

    import { getContext, type Snippet } from 'svelte';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        PlotDefaults,
        LinkableMarkProps
    } from '../types.js';
    import { resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { maybeSymbol } from '$lib/helpers/symbols.js';
    import { symbol as d3Symbol } from 'd3-shape';
    import { sort } from '$lib/index.js';
    import Mark from '../Mark.svelte';
    import DotCanvas from './helpers/DotCanvas.svelte';
    import { maybeData, isValid } from '$lib/helpers/index.js';
    import { recordizeXY } from '$lib/transforms/recordize.js';
    import { addEventHandlers } from './helpers/events.js';
    import Anchor from './helpers/Anchor.svelte';
    import type { D } from 'vitest/dist/chunks/reporters.d.DL9pg5DB.js';

    const DEFAULTS = {
        ...getContext<PlotDefaults>('svelteplot/_defaults').dot
    };

    let markProps: DotMarkProps = $props();

    const {
        data = [{} as Datum],
        canvas = false,
        class: className = '',
        dotClass = null,
        ...options
    }: DotMarkProps = $derived({ ...DEFAULTS, ...markProps });

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    function getSymbolPath(symbolType, size) {
        return d3Symbol(maybeSymbol(symbolType), size)();
    }

    const args = $derived(
        // todo: move sorting to Mark
        sort(
            recordizeXY({
                data: maybeData(data),
                // sort by descending radius by default
                ...(options.r ? { sort: { channel: '-r' } } : {}),
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
    defaults={{ r: 3, symbol: 'circle' }}
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
                                use:addEventHandlers={{
                                    getPlotState,
                                    options: args,
                                    datum: d.datum
                                }} />
                        </Anchor>
                    {/if}
                {/each}
            {/if}
        </g>
    {/snippet}
</Mark>
