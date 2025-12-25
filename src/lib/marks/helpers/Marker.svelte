<script module lang="ts">
    export type MarkerShape =
        | 'dot'
        | 'circle'
        | 'circle-stroke'
        | 'arrow'
        | 'arrow-reverse'
        | 'tick'
        | 'tick-x'
        | 'tick-y';
</script>

<!-- 
    @component Marker is a helper component that creates a marker for use in a line or path.
-->

<script lang="ts">
    import { getContext } from 'svelte';
    import { getPlotDefaults } from 'svelteplot/hooks/plotDefaults';

    type MarkerProps = {
        id: string;
        shape: MarkerShape;
        color: string;
    };

    let { id, shape, color }: MarkerProps = $props();

    const tickMarker = (orient: number | 'auto') => ({
        viewBox: '-3 -3 6 6',
        path: 'M0,-3v6',
        width: 6,
        height: 6,
        orient,
        color: 'stroke'
    });

    const MARKERS: Record<
        MarkerShape,
        {
            path?: string;
            width: number;
            height: number;
            orient: number | 'auto';
            color: 'fill' | 'stroke';
            bg?: 'fill' | 'stroke';
            viewBox?: string;
        }
    > = {
        circle: { width: 6.67, height: 6.67, orient: 0, color: 'fill', bg: 'stroke' },
        dot: { width: 6.67, height: 6.67, orient: 0, color: 'fill' },
        'circle-stroke': { width: 6.67, height: 6.67, orient: 0, color: 'stroke', bg: 'fill' },
        tick: tickMarker('auto'),
        'tick-x': tickMarker(90),
        'tick-y': tickMarker(0),
        arrow: {
            path: 'M-1.5,-3l3,3l-3,3',
            width: 6.67,
            height: 6.67,
            orient: 'auto',
            color: 'stroke'
        },
        'arrow-reverse': {
            path: 'M1.5,-3l-3,3l3,3',
            width: 6.67,
            height: 6.67,
            orient: 'auto',
            color: 'stroke'
        }
    };

    const defaultDotRadius = getPlotDefaults().markerDotRadius;

    const markerColors = $derived({
        fill: 'none',
        [MARKERS[shape].color]: color,
        ...(MARKERS[shape].bg ? { [MARKERS[shape].bg as string]: 'var(--svp-bg)' } : {})
    });
</script>

<marker
    {id}
    viewBox={MARKERS[shape].viewBox || '-5 -5 10 10'}
    markerWidth={MARKERS[shape].width}
    orient={MARKERS[shape].orient}
    markerHeight={MARKERS[shape].height}
    stroke-width="1.5"
    {...markerColors}>
    {#if shape === 'dot' || shape === 'circle' || shape === 'circle-stroke'}
        <circle r={defaultDotRadius} />
    {:else}
        <path d={MARKERS[shape].path} />
    {/if}
</marker>
