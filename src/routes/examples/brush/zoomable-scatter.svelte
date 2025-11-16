<script module lang="ts">
    export const title = 'Zoomable scatter plot';
    export const fullCode = true;
</script>

<script lang="ts">
    import { Plot, Dot, Brush, Frame } from 'svelteplot';
    import { Tween } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { page } from '$app/state';
    import { extent } from 'd3-array';

    const { penguins } = $derived(page.data.data);

    let brush = $state({ enabled: false });
    let isZoomedIn = $state(false);

    const fullDomainX = extent(
        penguins,
        (d) => d.culmen_length_mm
    );
    const fullDomainY = extent(
        penguins,
        (d) => d.culmen_depth_mm
    );

    let domainX = $state(fullDomainX);
    let domainY = $state(fullDomainY);

    function resetZoom() {
        domainX = fullDomainX;
        domainY = fullDomainY;
        isZoomedIn = false;
    }

    const domainXT = Tween.of(() => domainX, {
        easing: cubicInOut
    });
    const domainYT = Tween.of(() => domainY, {
        easing: cubicInOut
    });
</script>

<div style="touch-action: none">
    <Plot
        grid
        x={{
            domain: domainXT.current,
            label: 'culmen_length_mm'
        }}
        y={{
            domain: domainYT.current,
            label: 'culmen_depth_mm'
        }}>
        <Dot
            data={penguins}
            x="culmen_length_mm"
            y="culmen_depth_mm"
            stroke="species"
            symbol="species" />
        {#if !isZoomedIn}
            <Brush
                bind:brush
                cursor="zoom-in"
                onbrushend={(e) => {
                    if (e.brush.enabled) {
                        domainX = [e.brush.x1, e.brush.x2];
                        domainY = [e.brush.y1, e.brush.y2];
                        brush.enabled = false;
                        isZoomedIn = true;
                    }
                }} />
        {:else}
            <Frame
                stroke={false}
                fill="transparent"
                cursor="zoom-out"
                onpointerup={resetZoom} />
        {/if}
    </Plot>
</div>
