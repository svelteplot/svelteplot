<script module lang="ts">
    export const title = 'Zoomable scatter plot';
    export const fullCode = true;
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, Dot, Brush, Frame } from 'svelteplot';
    import { Tween } from 'svelte/motion';
    import { cubicInOut } from 'svelte/easing';
    import { extent } from 'd3-array';

    type PenguinRow = {
        culmen_length_mm: number;
        culmen_depth_mm: number;
        species: string;
    };

    const { penguins } = $props() as {
        penguins: PenguinRow[];
    };

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

    let domainX: [number, number] | [undefined, undefined] =
        $state(fullDomainX);
    let domainY: [number, number] | [undefined, undefined] =
        $state(fullDomainY);

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
            domain: domainXT.current as any,
            label: 'culmen_length_mm'
        }}
        y={{
            domain: domainYT.current as any,
            label: 'culmen_depth_mm'
        }}>
        <Dot
            data={penguins as any}
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
                        domainX = [
                            e.brush.x1 as any,
                            e.brush.x2 as any
                        ];
                        domainY = [
                            e.brush.y1 as any,
                            e.brush.y2 as any
                        ];
                        brush.enabled = false;
                        isZoomedIn = true;
                    }
                }} />
        {:else}
            <Frame
                stroke={'none' as any}
                fill="transparent"
                cursor="zoom-out"
                onpointerup={resetZoom} />
        {/if}
    </Plot>
</div>
