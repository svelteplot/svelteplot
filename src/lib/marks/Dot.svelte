<!-- @component
    Creates dots or symbols at specified positions with customizable size and appearance
-->
<script module lang="ts">
    export type DotMarkProps = BaseMarkProps & {
        data: DataRecord[];
        x: ChannelAccessor;
        y: ChannelAccessor;
        r?: ChannelAccessor;
        symbol?: ChannelAccessor | Snippet<[number, string]>;
        canvas?: boolean;
        dotClass?: ConstantAccessor<string>;
    };
</script>

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

    let {
        data = [{}],
        canvas = false,
        class: className = '',
        dotClass = null,
        ...options
    }: DotMarkProps = $props();

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
                {#each scaledData as d, i (i)}
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
