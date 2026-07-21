<script module lang="ts">
    export const title = 'Hull blurred with filter';
    export const description =
        'Convex hulls drawn around each penguin species cluster, with fill and stroke colored by species.';
    export const data = { penguins: '/data/penguins.csv' };
    export const sortKey = 11;
</script>

<script lang="ts">
    import { Plot, Hull, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot color={{ legend: true }}>
    <defs>
        <filter id="blur">
            <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="5" />
        </filter>
    </defs>
    <Hull
        data={penguins}
        x="body_mass_g"
        y="bill_length_mm"
        fill="species"
        svgFilter="url(#blur)"
        opacity={0.2} />
    <Dot
        data={penguins}
        x="body_mass_g"
        y="bill_length_mm"
        fill="species" />
</Plot>
