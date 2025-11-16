<script module lang="ts">
    export const title = 'Overview and detail';
    export const fullCode = true;
</script>

<script lang="ts">
    import {
        Plot,
        Frame,
        Line,
        AreaY,
        RectX,
        BrushX
    } from 'svelteplot';
    import { page } from '$app/state';

    const { aapl } = $derived(page.data.data);

    let brush = $state({
        enabled: true,
        x1: new Date(2017, 0, 1),
        x2: new Date(2018, 0, 1)
    });

    const filteredData = $derived(
        brush.enabled
            ? aapl.filter(
                  (d) =>
                      d.Date >= brush.x1 &&
                      d.Date <= brush.x2
              )
            : aapl
    );
</script>

<!-- overview plot -->
<div style="touch-action: none">
    <Plot
        height={90}
        x={{ label: '', grid: true }}
        y={{ axis: false, label: '' }}>
        <Frame opacity={0.4} />
        <Line
            data={aapl}
            x="Date"
            y="Close"
            opacity={0.3} />
        {#if brush.enabled}
            <RectX
                {...brush}
                fill="var(--svp-blue)"
                opacity={0.2} />
            <Line data={filteredData} x="Date" y="Close" />
        {/if}
        <BrushX
            bind:brush
            stroke={false}
            constrainToDomain />
    </Plot>
</div>
<!-- detail plot -->
<Plot
    y={{ insetTop: 10, insetBottom: 10 }}
    grid
    marginBottom={30}>
    <AreaY
        data={filteredData}
        x="Date"
        y="Close"
        fill="var(--svp-blue)"
        opacity={0.1} />
    <Line data={filteredData} x="Date" y="Close" />
</Plot>
