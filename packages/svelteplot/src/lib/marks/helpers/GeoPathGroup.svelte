<!-- @component
    Renders GeoJSON geometries as SVG <path> elements (or via canvas when
    canvas=true).  Used by the Contour and Density marks.  Each path's style is
    resolved per-threshold using a color keyword (e.g. "value" or "density") that
    maps the RAW_VALUE attached to each fake datum through the plot's color scale.
-->
<script lang="ts">
    import type { ScaledDataRecord, PlotState } from 'svelteplot/types/index.js';
    import type { GeoPath } from 'd3-geo';
    import { RAW_VALUE } from '../../transforms/recordize.js';
    import GeoPathCanvas from './GeoPathCanvas.svelte';

    let {
        scaledData,
        path,
        geomKey,
        colorKeyword,
        fill,
        stroke,
        strokeWidth,
        strokeOpacity,
        fillOpacity,
        opacity,
        strokeMiterlimit,
        clipPath,
        className,
        ariaLabel,
        canvas = false,
        plot,
        usePerPathFill = false,
        usePerPathStroke = false
    }: {
        scaledData: ScaledDataRecord[];
        /** d3 geoPath renderer (must NOT have a canvas context set). */
        path: GeoPath;
        /** Symbol key used to retrieve the GeoJSON geometry from each datum. */
        geomKey: symbol;
        /**
         * The color keyword that, when used as fill/stroke, maps the threshold
         * value through the plot's color scale.  E.g. "value" for Contour,
         * "density" for Density.
         */
        colorKeyword: string;
        fill: string;
        stroke: string;
        strokeWidth?: number;
        strokeOpacity?: number;
        fillOpacity?: number;
        opacity?: number;
        strokeMiterlimit?: number;
        clipPath?: string;
        className?: string;
        ariaLabel?: string;
        /** Render using a canvas element instead of SVG paths. */
        canvas?: boolean;
        plot: PlotState;
        /**
         * When true, per-path fill color is read from `d.fill` in scaledData
         * (z-group coloring).  Must be set explicitly; avoids accidental fill
         * when fill channel is only registered for color-scale domain purposes.
         */
        usePerPathFill?: boolean;
        /**
         * When true, per-path stroke color is read from `d.stroke` in scaledData
         * (z-group coloring).
         */
        usePerPathStroke?: boolean;
    } = $props();

    /** Resolve a fill/stroke prop that may be the colorKeyword. */
    function resolveColor(prop: string | undefined, value: number): string {
        if (prop != null && prop.toLowerCase() === colorKeyword.toLowerCase()) {
            return (plot.scales.color?.fn(value) as string) ?? 'currentColor';
        }
        return prop ?? 'none';
    }

    /** Build the inline style string for a single contour/density path. */
    function buildStyle(d: ScaledDataRecord, value: number): string {
        const parts: string[] = [];
        parts.push(
            `fill:${usePerPathFill && d.fill ? (d.fill as string) : resolveColor(fill, value)}`
        );
        parts.push(
            `stroke:${usePerPathStroke && d.stroke ? (d.stroke as string) : resolveColor(stroke, value)}`
        );
        if (strokeWidth != null) parts.push(`stroke-width:${strokeWidth}`);
        if (strokeOpacity != null) parts.push(`stroke-opacity:${strokeOpacity}`);
        if (fillOpacity != null) parts.push(`fill-opacity:${fillOpacity}`);
        if (opacity != null) parts.push(`opacity:${opacity}`);
        if (strokeMiterlimit != null) parts.push(`stroke-miterlimit:${strokeMiterlimit}`);
        return parts.join(';');
    }
</script>

{#if canvas}
    <GeoPathCanvas
        {scaledData}
        {path}
        {geomKey}
        {colorKeyword}
        {fill}
        {stroke}
        {strokeWidth}
        {strokeOpacity}
        {fillOpacity}
        {opacity}
        {strokeMiterlimit}
        {usePerPathFill}
        {usePerPathStroke} />
{:else}
    <g clip-path={clipPath} class={className || null} aria-label={ariaLabel}>
        {#each scaledData as d, i (i)}
            {@const geom = d.datum[geomKey as any] as any}
            {#if geom?.coordinates?.length}
                <path
                    d={path(geom)}
                    style={buildStyle(d, (d.datum[RAW_VALUE as any] as number) ?? 0)} />
            {/if}
        {/each}
    </g>
{/if}
