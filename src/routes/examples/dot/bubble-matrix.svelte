<script module>
    export let title = 'Bubble matrix';
    export const data = { penguins: '/data/penguins.csv' };
</script>

<script lang="ts">
    import { Plot, Dot, group } from 'svelteplot';
    import type { PenguinsRow } from '../types';
    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot
    marginLeft={60}
    height={240}
    grid
    color={{ legend: true }}
    x={{ sort: true }}
    r={{ range: [0, 40] }}>
    <Dot
        {...group(
            {
                data: penguins,
                x: 'species',
                y: 'island',
                stroke: 'sex'
            },
            { r: 'count' }
        )} />
</Plot>
