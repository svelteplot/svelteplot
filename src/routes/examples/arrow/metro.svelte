<script module>
    export const title = 'Bended arrows';
    export const description = `Rising inequality (and population) in various U.S. cities from 1980 to 2015. Each arrow represents two observations of a city: the city’s population (x) and inequality (y) in 1980, and the same in 2015. Based on an example from <a href="https://observablehq.com/@observablehq/plot-arrow-variation-chart">Observable Plot</a>.`;
    export const data = { metros: '/data/metros.csv' };
</script>

<script lang="ts">
    import {
        Plot,
        Arrow,
        Text,
        setPlotDefaults
    } from 'svelteplot';
    import type { MetrosRow } from '../types';
    let { metros }: { metros: MetrosRow[] } = $props();

    setPlotDefaults({
        arrow: {
            headAngle: 45
        }
    });

    let hl = $state<MetrosRow | null>(null);
</script>

<Plot
    grid
    marginRight={20}
    inset={10}
    height={450}
    x={{ type: 'log', label: 'Population' }}
    y={{ label: 'Inequality' }}
    color={{
        label: 'Change in inequality from 1980 to 2015',
        legend: true,
        tickFormat: {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        }
    }}>
    <Arrow
        data={metros}
        x1="POP_1980"
        y1="R90_10_1980"
        x2="POP_2015"
        y2="R90_10_2015"
        bend
        style="transition: opacity 0.2s ease-in"
        opacity={{
            scale: null,
            value: (d) =>
                !hl || hl.Metro === d.Metro ? 1 : 0.1
        }}
        onmouseenter={(evt, d) => (hl = d ?? null)}
        onmouseleave={() => (hl = null)}
        stroke={(d) => d.R90_10_2015 - d.R90_10_1980} />
    <Text
        data={metros}
        x="POP_2015"
        y="R90_10_2015"
        filter={(d) =>
            hl
                ? hl.Metro === d.Metro
                : Boolean(d.highlight)}
        text="nyt_display"
        fill="currentColor"
        stroke="var(--svelteplot-bg)"
        strokeWidth={4}
        lineAnchor="bottom"
        dy={-6} />
</Plot>
