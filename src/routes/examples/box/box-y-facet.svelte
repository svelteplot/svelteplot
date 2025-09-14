<script module>
    export const title = 'BoxY (faceted)';
    export const sortKey = 20;
</script>

<script lang="ts">
    import { Plot, BoxY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { penguins } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot grid>
    <BoxY
        data={penguins}
        x="species"
        y="flipper_length_mm"
        fill="species"
        fx="sex"
        tickMinMax
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
