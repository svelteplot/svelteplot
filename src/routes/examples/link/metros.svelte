<script module>
    export const title = 'Link';
    export const data = { metros: '/data/metros.csv' };
</script>

<script lang="ts">
    import { Plot, Link, Dot, Text } from 'svelteplot';
    import type { MetrosRow } from '../types';
    let { metros }: { metros: MetrosRow[] } = $props();

    let hl: false | MetrosRow = $state(false);
</script>

<Plot
    grid
    marginRight={20}
    inset={10}
    height={450}
    x={{ type: 'log', label: 'Population' }}
    y={{ label: 'Inequality' }}
    color={{
        scheme: 'BuRd',
        pivot: 1.5,
        label: 'Change in inequality from 1980 to 2015',
        legend: true
    }}>
    <Link
        data={metros}
        x1="POP_1980"
        y1="R90_10_1980"
        x2="POP_2015"
        y2="R90_10_2015"
        bend
        markerEnd="arrow"
        style="transition: opacity 0.2s ease-in"
        opacity={{
            scale: null,
            value: (d) =>
                !hl || hl.Metro === d.Metro ? 1 : 0.1
        }}
        onmouseenter={(event, d) => (hl = d)}
        onmouseleave={() => (hl = null)}
        stroke={(d) => d.R90_10_2015 - d.R90_10_1980} />
    <Text
        data={metros}
        x="POP_2015"
        y="R90_10_2015"
        filter={(d) =>
            hl ? d.Metro === hl.Metro : d.highlight}
        text="nyt_display"
        fill="currentColor"
        stroke="var(--svelteplot-bg)"
        strokeWidth={4}
        lineAnchor="bottom"
        dy={-6} />
</Plot>
