<script module lang="ts">
    export const title = 'Trade balance';
    export const description =
        'Difference between US exports to and imports from the UK, with areas colored by sign.';
</script>

<script lang="ts">
    import { Plot, Line, DifferenceY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { trade } = $derived(
        page.data.data as ExamplesData
    );
</script>

<Plot grid>
    <DifferenceY
        data={trade}
        x="Year"
        y1="Imports"
        y2="Exports"
        curve="basis"
        opacity={0.3}
        positiveFill="var(--svp-blue)"
        negativeFill="var(--svp-red)" />
    <Line
        data={trade}
        x="Year"
        y="Imports"
        stroke="var(--svp-red)"
        curve="basis" />
    <Line
        data={trade}
        x="Year"
        y="Exports"
        stroke="var(--svp-blue)"
        curve="basis" />
</Plot>

