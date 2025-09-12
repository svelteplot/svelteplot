<script module>
    export const title = 'BoxX (horizontal)';
</script>

<script lang="ts">
    import { Plot, BoxX } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { penguins } = $derived(page.data.data) as ExamplesData;
</script>

<Plot x={{ grid: true }}>
    <BoxX
        data={penguins}
        x="flipper_length_mm"
        y="species"
        tickMinMax
        dot={{ fill: true }}
        bar={{ fill: 'var(--svelteplot-bg)', stroke: 'currentColor' }} />
</Plot>

