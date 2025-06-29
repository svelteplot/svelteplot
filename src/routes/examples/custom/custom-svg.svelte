<script module>
    export const title = 'Custom SVG marks';
</script>

<script lang="ts">
    import { Plot, CustomMark } from 'svelteplot';
    import Spiral from '$lib/ui/Spiral.svelte';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    let { penguins } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot
    grid
    inset={10}
    color={{ legend: true }}
    r={{ range: [0.4, 1.4], zero: false }}>
    <defs>
        <symbol
            id="spiral"
            width="24"
            height="24"
            viewBox="-12 -12 24 24">
            <Spiral
                stroke="currentColor"
                finalRadius={10}
                duration={4} />
        </symbol>
    </defs>
    <CustomMark
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="species"
        r="body_mass_g">
        {#snippet children({ record, usedScales })}
            <use
                transform={`translate(${record.x}, ${record.y}) scale(${record.r})`}
                href="#spiral"
                x="-12"
                y="-12"
                color={record.fill}
                ><title>{record.datum.species}</title></use>
        {/snippet}
    </CustomMark>
</Plot>
