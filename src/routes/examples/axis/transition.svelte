<script module>
    export const title = 'Axis Transitions';
</script>

<script lang="ts">
    import { range } from 'd3-array';

    import { fade } from 'svelte/transition';
    import {
        Plot,
        RuleX,
        RuleY,
        Line,
        Dot,
        setPlotDefaults
    } from 'svelteplot';

    let domain = $state([-50, 50]);

    const data = range(-50, 50, 5).map((i) => ({
        x: i,
        y: Math.sin(i / 30) * 40
    }));

    setPlotDefaults({
        axis: {
            tIn: [fade, { duration: 300, delay: 500 }],
            tOut: [fade, { duration: 300 }]
        },
        grid: {
            tIn: [fade, { duration: 300, delay: 500 }],
            tOut: [fade, { duration: 300 }]
        }
    });
</script>

<button
    onclick={() =>
        (domain = [
            Math.random() * -100,
            Math.random() * 100
        ].sort((a, b) => a - b))}>change domain</button>

<Plot
    grid
    marginTop={20}
    marginRight={20}
    x={{ domain, nice: true }}
    y={{ domain, nice: true }}>
    <RuleX x={0} />
    <RuleY y={0} />
    <Line {data} x="x" y="y" />
    <Dot fill {data} x="x" y="y" />
</Plot>

<style>
    :global(
        g.tick,
        g.grid-x line,
        g.grid-y line,
        g.rule-x line,
        g.rule-y line,
        g.dot path
    ) {
        transition: transform 0.5s ease-in-out;
    }
</style>
