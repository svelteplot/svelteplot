<!-- @component
    Renders a hexagonal grid decoration, typically used alongside hexbin-transformed data.
    A data-less mark similar to Frame.
-->
<script lang="ts">
    interface HexgridMarkProps {
        /** the hexagon bin width in pixels */
        binWidth?: number;
        /** the stroke color of the grid lines */
        stroke?: string;
        /** the stroke opacity of the grid lines */
        strokeOpacity?: number;
        /** the stroke width of the grid lines */
        strokeWidth?: number;
        /** the fill color of the hexagons */
        fill?: string;
        /** the fill opacity of the hexagons */
        fillOpacity?: number;
        /** CSS class name */
        class?: string;
    }

    import Mark from '../Mark.svelte';
    import type { MarkType } from '../types/index.js';
    import { usePlot } from 'svelteplot/hooks/usePlot.svelte.js';
    import {
        hexLattice,
        hexCellsInRect,
        hexagonSubpath,
        HEX_DEFAULT_BIN_WIDTH
    } from '../helpers/hexLattice.js';

    let markProps: HexgridMarkProps = $props();

    const {
        binWidth = HEX_DEFAULT_BIN_WIDTH,
        stroke = 'currentColor',
        strokeOpacity = 0.1,
        strokeWidth = 1,
        fill = 'none',
        fillOpacity,
        class: className = 'hexgrid'
    }: HexgridMarkProps = $derived({ ...markProps });

    const plot = usePlot();

    const pathData = $derived.by(() => {
        const ml = plot.options.marginLeft;
        const mt = plot.options.marginTop;
        const w = plot.facetWidth;
        const h = plot.facetHeight;

        const lattice = hexLattice(binWidth, ml + binWidth / 2, mt);
        let path = '';
        for (const [cx, cy] of hexCellsInRect(lattice, ml, mt, ml + w, mt + h)) {
            path += hexagonSubpath(cx, cy, lattice.rx, lattice.ry);
        }
        return path;
    });
</script>

<Mark type={'hexgrid' as MarkType}>
    <g class={className}>
        <path
            d={pathData}
            {fill}
            fill-opacity={fillOpacity}
            {stroke}
            stroke-opacity={strokeOpacity}
            stroke-width={strokeWidth} />
    </g>
</Mark>
