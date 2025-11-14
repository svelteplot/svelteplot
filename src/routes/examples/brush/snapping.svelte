<script module>
    export const title = 'Brush snapping';
    export const fullCode = true;
</script>

<script lang="ts">
    import { Plot, BarX, Rect, BrushX } from 'svelteplot';

    let brush = $state({ enabled: false, x1: 0, x2: 0 });

    const snappedBrush = $derived({
        ...brush,
        x1: Math.round((brush.x1 || 0) * 4) / 4,
        x2: Math.round((brush.x2 || 0) * 4) / 4
    });

    $effect(() => {
        // Disable the brush if it has snapped to a zero-width selection
        if (snappedBrush.x1 === snappedBrush.x2) {
            brush.enabled = false;
        }
    });
</script>

<button
    onclick={() => {
        brush = { enabled: true, x1: 1.5, x2: 3 };
    }}>reset to [1.5, 3]</button>
<Plot grid>
    {#if brush.enabled}
        <Rect
            {...snappedBrush}
            fill="magenta"
            opacity={0.5} />
    {/if}
    <BarX data={[1, 2, 4]} opacity={0.5} />
    <BrushX bind:brush constrainToDomain stroke={false} />
</Plot>
