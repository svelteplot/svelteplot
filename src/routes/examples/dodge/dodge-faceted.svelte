<script module>
    export const title = 'Faceted beeswarm';
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
