<script module lang="ts">
    export const title = 'Anomaly vs baseline';
    export const description =
        'Temperature anomalies relative to a zero baseline, with positive and negative areas colored separately.';
</script>

<script lang="ts">
    import { Plot, DifferenceY, RuleY } from 'svelteplot';
    import { page } from '$app/state';
    import type { ExamplesData } from '../types';

    let { gistemp } = $derived(
        page.data.data as ExamplesData
    );
</script>

<Plot height={350} y={{ grid: true }}>
    <DifferenceY
        data={gistemp}
        x="Date"
        y="Anomaly"
        curve="step"
        positiveFill="var(--svp-red)"
        negativeFill="var(--svp-blue)" />
    <RuleY data={[0]} />
</Plot>
