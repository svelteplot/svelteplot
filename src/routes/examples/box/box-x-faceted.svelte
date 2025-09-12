<script module>
    export const title = 'BoxX (faceted)';
    export const sortKey = 20;
</script>

<script lang="ts">
    import { Plot, BoxX } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { penguins } = $derived(
        page.data.data
    ) as ExamplesData;
</script>

<Plot
    height={400}
    y={{ grid: true }}
    x={{ insetLeft: 5, insetRight: 5 }}>
    <BoxX
        data={penguins}
        x="flipper_length_mm"
        y="species"
        fy="sex"
        stroke="sex"
        fill="sex"
        tickMinMax
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
