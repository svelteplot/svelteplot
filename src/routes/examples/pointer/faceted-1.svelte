<script module>
    export const title = 'Faceted Pointer (1)';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, Dot, Pointer } from 'svelteplot';
    import type { PenguinsRow } from '../types';
    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<div style="touch-action: none">
    <Plot grid marginTop={40}>
        <Dot
            data={penguins}
            x="culmen_length_mm"
            fx="species"
            stroke="species"
            opacity={0.4}
            y="culmen_depth_mm" />
        <Pointer
            data={penguins}
            x="culmen_length_mm"
            fx="species"
            y="culmen_depth_mm"
            maxDistance={30}>
            {#snippet children({ data })}
                <Dot
                    {data}
                    x="culmen_length_mm"
                    y="culmen_depth_mm"
                    fill="species"
                    fx="species"
                    r={6} />
            {/snippet}
        </Pointer>
    </Plot>
</div>
