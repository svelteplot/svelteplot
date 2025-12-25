<script module>
    export let title = 'Bubble matrix';
    export const data = { penguins: '/data/penguins.csv' };
    export const repl =
        'https://svelte.dev/playground/98d56d6f0f074e689e5aba80c2e10019?version=latest';
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
