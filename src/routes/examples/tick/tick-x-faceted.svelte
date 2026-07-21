<script module>
    export const title = 'Faceted barcode';
    export const description = `Based on an example from <a href="https://observablehq.com/@observablehq/plot-barcode">Observable Plot</a>, this chart shows the age distribution of the population in each US state as horizontal ticks. The x position of each tick represents the share of the state's population in that age group.`;
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, RuleX, TickX } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot y={{ grid: true }} fy={{ axis: 'left' }}>
    <TickX
        data={penguins}
        x="body_mass_g"
        stroke="species"
        fy="species" />
</Plot>
