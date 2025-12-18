<script module>
    export const title = 'Slope chart axis';
    export const sortKey = 96;
    export const data = { metros: '/data/metros.csv' };
    export const repl =
        'https://svelte.dev/playground/2294d06d133a4d62a511f479cb6ae3d9?version=latest';
</script>

<script lang="ts">
    import { Plot, Dot, Link, AxisX } from 'svelteplot';
    import type { MetrosRow } from '../types';
    let { metros }: { metros: MetrosRow[] } = $props();
    const eastCoastStates =
        'ct,de,fl,ga,me,md,ma,nh,nj,ny,nc,ri,sc,va,vt,wv'.split(
            ','
        );
    const westCoastStates = ['ca', 'or', 'wa'];
    const metrosWithCoast = $derived(
        metros.map((d) => {
            const state = d.Metro.split(', ')[1].substring(
                0,
                2
            );
            return {
                ...d,
                state,
                coast: eastCoastStates.includes(state)
                    ? 'East'
                    : westCoastStates.includes(state)
                      ? 'West'
                      : 'Other'
            };
        })
    );
    const xDomain = [
        new Date(1980, 0, 1),
        new Date(2015, 0, 1)
    ];
</script>

<Plot inset={5} y={{ grid: true }}>
    <AxisX
        ticks={xDomain}
        tickSize={0}
        textAnchor={(d, i) => (i ? 'end' : 'start')} />

    <Link
        data={metrosWithCoast}
        fx="coast"
        marker="dot"
        opacity={0.5}
        x1={xDomain[0]}
        x2={xDomain[1]}
        y1="R90_10_1980"
        y2="R90_10_2015" />
</Plot>
