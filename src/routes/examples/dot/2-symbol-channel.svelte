<script module>
    export let title = 'Symbol channel';
    export const data = { penguins: '/data/penguins.csv' };
    export const repl =
        'https://svelte.dev/playground/95252b7d421c412b87fc5e07b0110d53?version=latest';
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';

    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot
    grid
    x={{ label: 'Body mass (g) →' }}
    y={{ label: '↑ Flipper length (mm)' }}
    symbol={{ legend: true }}>
    <Dot
        data={penguins}
        x="body_mass_g"
        y="flipper_length_mm"
        stroke="species"
        symbol="species" />
</Plot>
