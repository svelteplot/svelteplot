<!--
    @component
    Helper component for paths with markers and optional text along the path.
-->
<script lang="ts">
    import Marker, { type MarkerShape } from './Marker.svelte';
    import { isSnippet, randomId } from '$lib/helpers/index.js';
    import { resolveProp } from '$lib/helpers/resolve.js';
    import type {
        BaseMarkProps,
        ConstantAccessor,
        DataRecord,
        Mark,
        PlotContext,
        PlotScales
    } from '$lib/types.js';
    import { addEventHandlers } from './events.js';
    import { getContext } from 'svelte';

    type MarkerPathProps = BaseMarkProps & {
        /**
         * the datum associated with this path, usually the first
         * element of the data array group
         */
        datum: DataRecord;
        /**
         * the marker shape to use at the start of the path, defaults to
         * cirlce
         */
        markerStart?: boolean | MarkerShape;
        /**
         * the marker shape to use at the middle of the path, defaults to circle
         */
        markerMid?: boolean | MarkerShape;
        /**
         * the marker shape to use at the end of the path, defaults to circle
         */
        markerEnd?: boolean | MarkerShape;
        /**
         * shorthand for setting all markers
         */
        marker?: boolean | MarkerShape;
        /**
         * path string
         */
        d: string;
        style: string;
        startOffset: string;
        textStyle: string;
        textStyleClass?: string | null;
        text: string;
        transform: string;
        color: string;
        strokeWidth: ConstantAccessor<number>;
        mark: Mark<BaseMarkProps>;
        scales: PlotScales;
    };

    let {
        datum,
        markerStart,
        markerMid,
        markerEnd,
        marker,
        d,
        dInv,
        style,
        class: className = null,
        textStyleClass = null,
        startOffset,
        textStyle,
        text,
        transform,
        color,
        strokeWidth,
        mark
    }: MarkerPathProps = $props();

    const id = randomId();

    const { getPlotState } = getContext<PlotContext>('svelteplot');

    const points = $derived(text && d != null ? d.split(/[LMC]/).slice(1) : []);
    const hasPath = $derived(points.length > 0);
    const firstPt = $derived(text && hasPath ? points.at(0).split(',').map(Number) : []);
    const lastPt = $derived(text && hasPath ? points.at(-1).split(',').map(Number) : []);
    const leftToRight = $derived(text && hasPath ? firstPt[0] < lastPt.at(-2) : true);

    // use reversed path if the path is not left to right
    const textPath = $derived(!text || leftToRight ? d : dInv);
    const strokeWidth_ = $derived(resolveProp(strokeWidth, datum, 1.4));
</script>

<g
    {transform}
    class={className}
    stroke-width={strokeWidth_}
    use:addEventHandlers={{ getPlotState, options: mark.options, datum }}>
    {#each Object.entries( { start: markerStart, mid: markerMid, end: markerEnd, all: marker } ) as [key, marker]}
        {@const markerId = `marker-${key === 'all' ? '' : `${key}-`}${id}`}
        {#if isSnippet(marker)}
            {@render marker(markerId, color)}
        {:else if marker}
            <Marker
                id={markerId}
                shape={marker === true ? 'circle' : resolveProp(marker, datum)}
                {color} />
        {/if}
    {/each}
    {#if mark.options.onmouseenter || mark.options.onclick}
        <!-- add invisible path in bg for easier mouse access -->
        <path
            {d}
            style="fill:none;stroke-width: {(strokeWidth || 1) +
                10}; stroke: transparent; stroke-opacity:0" />
    {/if}
    <path
        marker-start={markerStart || marker
            ? `url(#marker-${markerStart ? 'start-' : ''}${id})`
            : null}
        marker-mid={markerMid || marker ? `url(#marker-${markerMid ? 'mid-' : ''}${id})` : null}
        marker-end={markerEnd || marker ? `url(#marker-${markerEnd ? 'end-' : ''}${id})` : null}
        {d}
        {style}
        use:addEventHandlers={{ getPlotState, options: mark.options, datum }} />
    {#if text}
        <!-- since textPath.side is not yet supported, we have to use an invisible
            path in order to keep the text from turning upside down -->
        <path d={textPath} {id} stroke="none" fill="none" />
        <text dy="-3" style={textStyle} class={textStyleClass}>
            <textPath {startOffset} href="#{id}">{text}</textPath>
        </text>
    {/if}
</g>

<style>
    text {
        font-size: 12px;
        paint-order: stroke fill;
    }
</style>
