<script module>
    export let title = 'Color scatterplot';
    export const data = { penguins: '/data/penguins.csv' };
    export const repl =
        'https://svelte.dev/playground/0dec5f64f30c4da5a6bf848918f38e74?version=latest';
</script>

<script lang="ts">
    import { Plot, Dot } from 'svelteplot';
    import type { PenguinsRow } from '../types';
    let { penguins }: { penguins: PenguinsRow[] } =
        $props();
</script>

<Plot>
    <Dot
        data={penguins}
        x="culmen_length_mm"
        y="culmen_depth_mm"
        stroke="species" />
</Plot>
