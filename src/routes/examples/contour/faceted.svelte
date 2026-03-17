<script module>
    export const title = 'Faceted contour';
    export const description =
        'Contour lines of the <a href="https://www.bgs.ac.uk/datasets/regional-geophysics-of-southwest-england/">CA55 aeromagnetic survey</a> over SW England, interpolated from scattered flight-line measurements using random-walk.';
    export const data = {
        penguins: '/data/penguins.csv'
    };
    export const sortKey = 35;
</script>

<script lang="ts">
    import { Plot, Contour } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    const { penguins } = $props<{
        penguins: PenguinsRow[];
    }>();
</script>

<Plot
    color={{
        type: 'linear',
        scheme: 'gnbu',
        legend: true
    }}>
    <Contour
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        fill="body_mass_g"
        blur={2}
        fy="species" />
</Plot>
