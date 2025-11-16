<script module>
    export const title = 'BoxY';
</script>

<script lang="ts">
    import { Plot, BoxY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { mpg } = $derived(page.data.data) as ExamplesData;
</script>

<Plot grid x={{ type: 'band' }} inset={10}>
    <BoxY
        data={mpg}
        x="class"
        y="hwy"
        fill="class"
        tickMinMax
        tickMedian={{
            stroke: 'var(--svelteplot-bg)',
            strokeWidth: 3
        }} />
</Plot>
