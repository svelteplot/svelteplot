<script module>
    export const title = 'Single SVG marks';
    export const description =
        'You can use the CustomMark to place a single SVG element at a specific x/y coordinate.';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, Dot, CustomMark } from 'svelteplot';
    import Spiral from '$lib/shared/ui/Spiral.svelte';
    import type { PenguinsRow } from '../types';
    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot grid>
    <CustomMark x={40} y={16}>
        {#snippet mark({ record })}
            <g
                transform="translate({record.x}, {record.y})">
                <circle
                    r={20}
                    opacity={0.2}
                    fill={record.fill} />
                <circle
                    r={80}
                    opacity={0.1}
                    fill={record.fill} />
            </g>
        {/snippet}
    </CustomMark>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species" />
</Plot>
