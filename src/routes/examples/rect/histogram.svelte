<script module lang="ts">
    export const title = 'Histogram';
    export const description =
        'A  histogram showing the distribution of Olympic athletes’ weights.';
    export const transforms = ['bin'];
    export const sortKey = 40;
</script>

<script lang="ts">
    import { Plot, RectY, RuleY, binX } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { olympians } = $derived(
        page.data.data as ExamplesData
    );
</script>

<Plot height={300} grid marginLeft={40}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
