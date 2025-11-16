<script module lang="ts">
    export const title = 'Stacked histogram';
    export const description =
        'A stacked histogram showing the distribution of Olympic athletes’ weights, colored by sex.';
    export const transforms = ['bin'];
    export const sortKey = 41;
    export const repl =
        'https://svelte.dev/playground/db322b8d3f1f47718bf822eb385d9a1e?version=5';
</script>

<script lang="ts">
    import { Plot, RectY, RuleY, binX } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { olympians } = $derived(
        page.data.data as ExamplesData
    );
</script>

<Plot
    height={300}
    grid
    marginLeft={40}
    color={{ legend: true }}>
    <RectY
        {...binX(
            { data: olympians, x: 'weight', fill: 'sex' },
            { y: 'count' }
        )} />
    <RuleY data={[0]} />
</Plot>
