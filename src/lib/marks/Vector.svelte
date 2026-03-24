<!--
    @component
    The vector mark lets you place shapes (like arrows) on your plot.
-->
<script lang="ts" module>
    export type { ShapeRenderer } from '../helpers/vectorShapes.js';
</script>

<script lang="ts" generics="Datum = DataRecord | GeoJSON.GeoJsonObject">
    interface VectorMarkProps extends BaseMarkProps<Datum> {
        /** the input data array; each element becomes one vector */
        data: Datum[];
        /** the horizontal position channel; bound to the x scale */
        x: ChannelAccessor<Datum>;
        /** the vertical position channel; bound to the y scale */
        y: ChannelAccessor<Datum>;
        /** the radius (width) of the vector shape in pixels */
        r?: number;
        /** the length of the vector in pixels */
        length?: ChannelAccessor<Datum>;
        /** rotation angle of the vector in degrees */
        rotate?: ChannelAccessor<Datum>;
        /**
         * Controls where the vector is anchored in relation to the x, y position.
         * If set to 'start', the arrow will start at the x, y position. If set to
         * 'middle', the arrow will be centered at the x, y position. If set to
         * 'end', the arrow will end at the x, y position.
         */
        anchor?: 'start' | 'middle' | 'end';
        /** the shape of the vector; can be a preset name or a custom ShapeRenderer */
        shape?: 'arrow' | 'spike' | 'arrow-filled' | ShapeRenderer;
        /** snippet for custom rendering inside the vector mark group */
        children?: Snippet;
        /** if true, renders using Canvas instead of SVG */
        canvas?: boolean;
    }
    import type {
        DataRecord,
        BaseMarkProps,
        ChannelAccessor,
        FacetContext
    } from '../types/index.js';

    import { getContext, type Snippet } from 'svelte';

    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { sort } from '../index.js';
    import Mark from '../Mark.svelte';
    import VectorCanvas from './helpers/VectorCanvas.svelte';
    import { isValid } from '../helpers/index.js';
    import { addEventHandlers } from './helpers/events.js';
    import { indexData } from 'svelteplot/transforms/recordize.js';
    import { getPlotDefaults } from '../hooks/plotDefaults.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';

    import {
        defaultRadius,
        maybeShape,
        shapePath,
        type ShapeRenderer
    } from '../helpers/vectorShapes.js';

    let markProps: VectorMarkProps = $props();
    const DEFAULTS = {
        ...getPlotDefaults().vector,
        r: defaultRadius
    };
    const {
        data = [{} as Datum],
        canvas,
        shape = 'arrow',
        anchor = 'middle',
        ...options
    }: VectorMarkProps = $derived({
        ...DEFAULTS,
        ...markProps
    });

    const plot = usePlot();

    const args = $derived(
        sort({
            data: indexData(data as object[]) as unknown as Datum[],
            // sort by descending radius by default
            ...options
        })
    );
</script>

<Mark
    type="vector"
    required={['x', 'y']}
    channels={[
        'x',
        'y',
        'r',
        'length',
        'symbol',
        'fill',
        'opacity',
        'stroke',
        'fillOpacity',
        'strokeOpacity'
    ]}
    {...args as any}>
    {#snippet children({ scaledData, usedScales })}
        <g class="vector" data-l={usedScales.length}>
            {#if canvas}
                <VectorCanvas
                    data={scaledData}
                    options={{ ...args, shape, anchor } as any}
                    {usedScales} />
            {:else}
                {#each scaledData as d, i (i)}
                    {#if d.valid && isValid(d.r)}
                        {@const [style, styleClass] = resolveStyles(
                            plot,
                            d,
                            {
                                strokeWidth: 1.5,
                                strokeLinejoin: 'round',
                                strokeLinecap: 'round',
                                ...args
                            } as any,
                            shape === 'arrow-filled' ? 'fill' : 'stroke',
                            usedScales
                        )}
                        <path
                            d={shapePath(shape, d.length as number, d.r as number)}
                            transform="translate({d.x}, {d.y}) rotate({resolveProp(
                                args.rotate,
                                d.datum as any,
                                0
                            ) as number}) {anchor === 'start'
                                ? ''
                                : anchor === 'end'
                                  ? `translate(0, ${d.length as number})`
                                  : `translate(0, ${(d.length as number) / 2})`}"
                            {style}
                            {@attach addEventHandlers({
                                plot,
                                options: args as any,
                                datum: d?.datum
                            })}
                            class={[styleClass]} />
                    {/if}
                {/each}
            {/if}
        </g>
    {/snippet}
</Mark>

<style>
    path {
        stroke-width: 1.5px;
    }
</style>
