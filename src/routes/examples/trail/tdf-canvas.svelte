<script module>
    export const title = 'Tour de France Trail (canvas)';
    export const data = { tdf: '/data/tdf.csv' };
    export const sortKey = 12;
    export const repl =
        'https://svelte.dev/playground/5e355dd50e8b468d8bb0686b4e373d34';
    export const description =
        'This example shows a Trail mark representing the elevation changes throughout the Tour de France route. Data from Github user <a href="https://github.com/jdai20/Project_4">jdai20</a>';
</script>

<script lang="ts">
    import { Plot, Line, Trail } from '$lib/index.js';

    let { tdf } = $props();
</script>

<Plot
    y={{ tickSpacing: 100 }}
    r={{ zero: false, range: [1, 20] }}
    aspectRatio={1}
    grid>
    <Trail
        canvas
        fill="var(--svp-red)"
        opacity={0.4}
        data={tdf}
        x="long"
        y="lat"
        r="elevation" />
    <Line canvas data={tdf} x="long" y="lat" />
</Plot>
