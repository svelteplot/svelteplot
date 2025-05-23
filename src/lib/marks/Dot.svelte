<script lang="ts">
    import { getContext, type Snippet } from 'svelte';
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        FacetContext,
        PlotDefaults
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

    type DotProps = BaseMarkProps & {
        data: DataRecord[];
        x: ChannelAccessor;
        y: ChannelAccessor;
        r?: ChannelAccessor;
        fill?: ChannelAccessor;
        stroke?: ChannelAccessor;
        symbol?: ChannelAccessor | Snippet<[number, string]>;
        children?: Snippet;
        dx?: ConstantAccessor<number>;
        dy?: ConstantAccessor<number>;
        canvas?: boolean;
        dotClass?: ConstantAccessor<string>;
        in?: any;
        inParams?: any;
        out?: any;
        outParams?: any;
        transition?: any;
        wrap?: Snippet;
    };

    let {
        data = [{}],
        canvas = false,
        class: className = '',
        dotClass = null,
        in: tIn = undefined,
        inParams = undefined,
        out: tOut = undefined,
        outParams = undefined,
        ...opts
    }: DotProps = $props();

    const theme = getContext('svelteplot/theme');
    const options = $derived({...(theme?.marks?.dot || {}), ...opts})

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    function getSymbolPath(symbolType, size) {
        return d3Symbol(maybeSymbol(symbolType), size)();
    }

    const { getTestFacet } = getContext<FacetContext>('svelteplot/facet');
    const { dotRadius } = getContext<PlotDefaults>('svelteplot/_defaults');
    let testFacet = $derived(getTestFacet());

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
    defaults={{ r: dotRadius, symbol: 'circle' }}
    {...args}>
    {#snippet children({ mark, usedScales, scaledData })}
        <g class="dots {className || ''}">
            {#if canvas}
                <DotCanvas data={scaledData} {mark} />
            {:else}
                {#each scaledData as d}
                    {#if d.valid && isValid(d.r)}
                        {@const [style, styleClass] = resolveStyles(
                            plot,
                            d,
                            { strokeWidth: 1.6, ...args },
                            'stroke',
                            usedScales
                        )}
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
                    {/if}
                {/each}
            {/if}
        </g>
    {/snippet}
</Mark>
