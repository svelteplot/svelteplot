<script module lang="ts">
    export const title = 'Year-over-year differences';
    export const description =
        'Apple stock price compared to a shifted copy of itself to show year-over-year differences.';
    export const transforms = ['shift'];
</script>

<script lang="ts">
    import { Plot, DifferenceY, shiftX } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { aapl } = $derived(page.data.data as ExamplesData);
</script>

<Plot height={350} grid>
    <DifferenceY
        stroke
        {...shiftX(
            { data: aapl, x: 'Date', y: 'Close' },
            { x1: `+365 days` }
        )}
        positiveFill="var(--svp-green)"
        negativeFill="var(--svp-red)" />
</Plot>
