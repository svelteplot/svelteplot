<script module>
    export const title = 'Tour de France Trail';
    export const data = { tdf: '/data/tdf.csv' };
    export const sortKey = 11;
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
        fill="var(--svp-red)"
        opacity={0.4}
        data={tdf}
        x="long"
        y="lat"
        r="elevation" />
    <Line data={tdf} x="long" y="lat" />
</Plot>
