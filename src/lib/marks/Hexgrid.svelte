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

    let markProps: HexgridMarkProps = $props();

    const {
        binWidth = 20,
        stroke = 'currentColor',
        strokeOpacity = 0.1,
        strokeWidth = 1,
        fill = 'none',
        fillOpacity,
        class: className = 'hexgrid'
    }: HexgridMarkProps = $derived({ ...markProps });

    const plot = usePlot();

    const sqrt3 = Math.sqrt(3);

    function r3(x: number) {
        return Math.round(x * 1000) / 1000;
    }

    const pathData = $derived.by(() => {
        // Hex offset constants matching hexbin transform
        const ox = 0.5;
        const oy = 0;
        const rx = binWidth / 2;
        const ry = rx * 2 / sqrt3;
        const dx = binWidth;
        const dy = ry * 1.5;

        const w = plot.facetWidth;
        const h = plot.facetHeight;
        const ml = plot.options.marginLeft;
        const mt = plot.options.marginTop;

        const cols = Math.ceil(w / dx) + 1;
        const rows = Math.ceil(h / dy) + 1;

        let path = '';
        for (let j = -1; j <= rows; j++) {
            for (let i = -1; i <= cols; i++) {
                const cx = r3((i + (j & 1) / 2 + ox) * dx + ml);
                const cy = r3((j + oy) * dy + mt);
                // Pointy-topped hexagon path
                path += `M${cx},${r3(cy - ry)}`;
                path += `l${r3(rx)},${r3(ry / 2)}`;
                path += `v${r3(ry)}`;
                path += `l${r3(-rx)},${r3(ry / 2)}`;
                path += `l${r3(-rx)},${r3(-ry / 2)}`;
                path += `v${r3(-ry)}Z`;
            }
        }
        return path;
    });
</script>

<Mark type={'hexgrid' as MarkType}>
    {#snippet children()}
        <g class={className}>
            <path
                d={pathData}
                fill={fill}
                fill-opacity={fillOpacity}
                stroke={stroke}
                stroke-opacity={strokeOpacity}
                stroke-width={strokeWidth}
            />
        </g>
    {/snippet}
</Mark>
