<script module lang="ts">
    export const title = 'Histogram';
    export const description =
        'A  histogram showing the distribution of Olympic athletes’ weights.';
    export const transforms = ['bin'];
    export const sortKey = 40;
    export const data = {
        olympians: '/data/olympians.csv'
    };
</script>

<script lang="ts">
    import { Plot, RectY, RuleY, binX } from 'svelteplot';
    import type { OlympiansRow } from '../types';

    let { olympians }: { olympians: OlympiansRow[] } =
        $props();
</script>

<Plot height={300} grid marginLeft={40}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight' },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
