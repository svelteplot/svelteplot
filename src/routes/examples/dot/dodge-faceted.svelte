<script module>
    export const title = 'Faceted beeswarm';
    export const sortKey = 32;
    export const transforms = ['dodge'];
    export const repl =
        'https://svelte.dev/playground/9763a9fac9e94b4ba31ffdf5c193a690?version=5';
    export const description = `Based on an example from <a href="https://observablehq.com/@observablehq/plot-dodge-penguins">Observable Plot</a>, this plot shows body mass of penguins across different species. Sex is encoded using color, and points are dodged to avoid overlap.`;
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { penguins } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot
    color={{ legend: true }}
    fx={{ axis: 'bottom' }}
    r={{ zero: false }}
    y={{ grid: true }}>
    <Dot
        data={penguins}
        fx="species"
        x={0}
        y="body_mass_g"
        fill="sex"
        dodgeX="middle" />
</Plot>
