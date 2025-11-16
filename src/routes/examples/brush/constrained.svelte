<script module>
    export const title = 'Constrained brush';
</script>

<script>
    import { Plot, Dot, Rect, Brush } from 'svelteplot';
    import { page } from '$app/state';

    const { penguins } = $derived(page.data.data);

    let brush = $state({
        enabled: true,
        x1: 42,
        x2: 55,
        y1: 16,
        y2: 20
    });
</script>

<Plot grid>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        opacity={brush.enabled ? 0.3 : 1}
        stroke={(d) => (brush.enabled ? 'gray' : d.species)}
        symbol="species" />
    {#if brush.enabled}
        <Rect {...brush} opacity={0.1} />
        <Dot
            data={penguins}
            filter={(d) =>
                d.culmen_length_mm >= brush.x1 &&
                d.culmen_length_mm <= brush.x2 &&
                d.culmen_depth_mm >= brush.y1 &&
                d.culmen_depth_mm <= brush.y2}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            stroke="species"
            symbol="species" />
    {/if}
    <Brush bind:brush constrainToDomain stroke={false} />
</Plot>
