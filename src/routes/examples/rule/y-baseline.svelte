<script module>
    export const title = 'Y Baseline';
    export const description =
        'A simple horizontal rule at y=0.';
</script>

<script lang="ts">
    import { Plot, Line, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';
    let { aapl } = $derived(page.data.data) as ExamplesData;
</script>

<Plot>
    <RuleY y={0} />
    <Line data={aapl} x="Date" y="Close" />
</Plot>
