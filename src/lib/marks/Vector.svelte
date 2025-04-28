<script lang="ts" module>
    import type {
        PlotContext,
        DataRecord,
        BaseMarkProps,
        ConstantAccessor,
        ChannelAccessor,
        FacetContext
    } from '../types.js';

    type D3Path = ReturnType<typeof import('d3-path').path>;

    export type ShapeRenderer = {
        draw(context: D3Path, l: number, r: number): void;
    };

    export type VectorMarkProps = BaseMarkProps & {
        data: DataRecord[];
        x: ChannelAccessor;
        y: ChannelAccessor;
        r?: number;
        length?: ChannelAccessor;
        rotate?: ChannelAccessor;
        fill?: ChannelAccessor;
        stroke?: ChannelAccessor;
        /**
         * Controls where the vector is anchored in relation to the x, y position.
         * If set to 'start', the arrow will start at the x, y position. If set to
         * 'middle', the arrow will be centered at the x, y position. If set to
         * 'end', the arrow will end at the x, y position.
         */
        anchor: 'start' | 'middle' | 'end';
        shape?: 'arrow' | 'spike' | 'arrow-filled' | ShapeRenderer;
        children?: Snippet;
        dx?: ConstantAccessor<number>;
        dy?: ConstantAccessor<number>;
        canvas?: boolean;
    };
</script>

<script lang="ts">
    import { getContext, type Snippet } from 'svelte';
    import { pathRound as path } from 'd3-path';

    import { resolveChannel, resolveProp, resolveStyles } from '../helpers/resolve.js';
    import { projectXY } from '../helpers/scales.js';
    import { sort } from '$lib/index.js';
    import Mark from '../Mark.svelte';
    //import DotCanvas from './helpers/DotCanvas.svelte';
    import { maybeData, testFilter, isValid } from '$lib/helpers/index.js';
    import { addEventHandlers } from './helpers/events.js';

    const defaultRadius = 3.5;

    // The size of the arrowhead is proportional to its length, but we still allow
    // the relative size of the head to be controlled via the mark’s width option;
    // doubling the default radius will produce an arrowhead that is twice as big.
    // That said, we’ll probably want a arrow with a fixed head size, too.
    const wingRatio = defaultRadius * 5;

    let {
        data = [{}],
        canvas,
        shape = 'arrow',
        anchor = 'middle',
        r = defaultRadius,
        ...options
    }: VectorMarkProps = $props();

    const { getPlotState } = getContext<PlotContext>('svelteplot');
    const plot = $derived(getPlotState());

    const { getTestFacet } = getContext<FacetContext>('svelteplot/facet');
    const testFacet = $derived(getTestFacet());

    const shapeArrow: ShapeRenderer = {
        draw(context: D3Path, l: number, r: number) {
            const wing = (l * r) / wingRatio;
            context.moveTo(0, 0);
            context.lineTo(0, -l);
            context.moveTo(-wing, wing - l);
            context.lineTo(0, -l);
            context.lineTo(wing, wing - l);
        }
    };

    const shapeSpike: ShapeRenderer = {
        draw(context: D3Path, l: number, r: number) {
            context.moveTo(-r, 0);
            context.lineTo(0, -l);
            context.lineTo(r, 0);
        }
    };

    const shapeArrowFilled: ShapeRenderer = {
        draw(context: D3Path, l: number, r: number) {
            // const wing = (l * r) / wingRatio;
            const headLength = Math.max(3, l * 0.3);
            const headSpike = headLength * 0.2;
            const headWidth = Math.max(2, l * 0.3);
            const tailWidth = Math.max(2, l * 0.3) * 0.3;

            context.moveTo(0, 0);

            context.lineTo(tailWidth * 0.5, -l + headLength - headSpike);
            context.lineTo(headWidth * 0.5, -l + headLength);
            context.lineTo(0, -l);
            context.lineTo(-headWidth * 0.5, -l + headLength);
            context.lineTo(-tailWidth * 0.5, -l + headLength - headSpike);

            context.closePath();
        }
    };

    const shapes = new Map([
        ['arrow', shapeArrow],
        ['arrow-filled', shapeArrowFilled],
        ['spike', shapeSpike]
    ]);

    function isShapeObject(value: any): value is ShapeRenderer {
        return value && typeof value.draw === 'function';
    }

    function maybeShape(shape: 'arrow' | 'spike' | 'arrow-filled' | ShapeRenderer) {
        if (isShapeObject(shape)) return shape;
        const value = shapes.get(`${shape}`.toLowerCase());
        if (value) return value;
        throw new Error(`invalid shape: ${shape}`);
    }

    function shapePath(
        shape: 'arrow' | 'spike' | 'arrow-filled' | ShapeRenderer,
        l: number,
        r: number
    ) {
        const context = path();
        maybeShape(shape).draw(context, l, r);
        return context.toString();
    }

    const args = $derived(
        sort({
            data: maybeData(data),
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
    {...args}>
    {#snippet children({ mark, scaledData, usedScales })}
        <g class="vector" data-l={usedScales.length}>
            {#if canvas}
                <text x="30" y="30" style="color:red"
                    >implement canvas rendering for vector mark</text>
            {:else}
                {#each scaledData as d}
                    {@const r = resolveChannel('r', d.datum, { r: 3, ...args })}
                    {#if d.valid && isValid(r)}
                        {@const dx = +resolveProp(args.dx, d.datum, 0)}
                        {@const dy = +resolveProp(args.dx, d.datum, 0)}
                        {@const [style, styleClass] = resolveStyles(
                            plot,
                            d,
                            {
                                strokeWidth: 1.5,
                                strokeLinejoin: 'round',
                                strokeLinecap: 'round',
                                ...args
                            },
                            shape === 'arrow-filled' ? 'fill' : 'stroke',
                            usedScales
                        )}
                        <path
                            d={shapePath(shape, d.length, r)}
                            transform="translate({d.x + dx}, {d.y + dy}) rotate({resolveProp(
                                args.rotate,
                                d.datum,
                                0
                            )}) {anchor === 'start'
                                ? ''
                                : anchor === 'end'
                                  ? `translate(0, ${d.length})`
                                  : `translate(0, ${d.length / 2})`}"
                            {style}
                            use:addEventHandlers={{
                                getPlotState,
                                options: args,
                                datum: d.datum
                            }}
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
